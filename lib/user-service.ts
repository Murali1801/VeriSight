import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

export interface UserData {
  uid: string
  email: string | null
  displayName: string
  createdAt: string
  karma: number
  totalAnalyses: number
  accuracyRate: number
  communityVotes: number
  badges: string[]
  photoURL?: string
}

export interface AnalysisResult {
  id: string
  userId: string
  type: "text" | "image" | "video"
  content: string
  verdict: "FAKE" | "REAL"
  credibilityScore: number
  summary: string
  sources: string[]
  breakdown: {
    textAnalysis: number
    imageAnalysis: number
    sourceVerification: number
    communityFeedback: number
  }
  createdAt: string
  communityVotes: {
    up: number
    down: number
  }
  userDisplayName?: string
  userPhotoURL?: string | null
}

export interface UserVote {
  userId: string
  analysisId: string
  vote: "up" | "down"
  createdAt: string
}

// User data operations
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Real-time user data listener
export const subscribeToUserData = (uid: string, callback: (data: UserData | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserData)
    } else {
      callback(null)
    }
  }, (error) => {
    console.error("Error listening to user data:", error)
    callback(null)
  })
}

export const updateUserData = async (uid: string, data: Partial<UserData>) => {
  try {
    await updateDoc(doc(db, "users", uid), data)
  } catch (error) {
    console.error("Error updating user data:", error)
    throw error
  }
}

export const incrementUserStats = async (uid: string, field: keyof UserData, value: number = 1) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      [field]: increment(value),
    })
  } catch (error) {
    console.error("Error incrementing user stats:", error)
    throw error
  }
}

// Analysis operations
export const saveAnalysis = async (analysis: Omit<AnalysisResult, "id" | "createdAt">) => {
  try {
    const analysisData = {
      ...analysis,
      createdAt: new Date().toISOString(),
      communityVotes: {
        up: 0,
        down: 0,
      },
    }
    
    const docRef = await addDoc(collection(db, "analyses"), analysisData)
    
    // Increment user's total analyses
    await incrementUserStats(analysis.userId, "totalAnalyses")
    
    return docRef.id
  } catch (error) {
    console.error("Error saving analysis:", error)
    throw error
  }
}

export const getUserAnalyses = async (userId: string, limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, "analyses"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisResult[]
  } catch (error: any) {
    console.error("Error getting user analyses:", error)
    
    // If it's an index error, try without ordering
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log("Index not ready, fetching without ordering...")
      const q = query(
        collection(db, "analyses"),
        where("userId", "==", userId),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisResult[]
      
      // Sort manually on client side
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    throw error
  }
}

// Real-time user analyses listener
export const subscribeToUserAnalyses = (userId: string, limitCount: number = 10, callback: (analyses: AnalysisResult[]) => void): Unsubscribe => {
  try {
    const q = query(
      collection(db, "analyses"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const analyses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisResult[]
      callback(analyses)
    }, (error: any) => {
      console.error("Error listening to user analyses:", error)
      
      // Fallback for index errors
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log("Index not ready, using fallback query...")
        const fallbackQ = query(
          collection(db, "analyses"),
          where("userId", "==", userId),
          limit(limitCount)
        )
        
        onSnapshot(fallbackQ, (querySnapshot) => {
          const analyses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AnalysisResult[]
          
          // Sort manually on client side
          const sortedAnalyses = analyses.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          callback(sortedAnalyses)
        }, (fallbackError) => {
          console.error("Fallback query also failed:", fallbackError)
          callback([])
        })
      } else {
        callback([])
      }
    })
  } catch (error) {
    console.error("Error setting up user analyses listener:", error)
    callback([])
    return () => {}
  }
}

export const getRecentAnalyses = async (limitCount: number = 20) => {
  try {
    const q = query(
      collection(db, "analyses"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const analyses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisResult[]

    // Fetch user data for each analysis
    const analysesWithUsers = await Promise.all(
      analyses.map(async (analysis) => {
        try {
          const userData = await getUserData(analysis.userId)
          return {
            ...analysis,
            userDisplayName: userData?.displayName || "Anonymous User",
            userPhotoURL: userData?.photoURL || null,
          }
        } catch (error) {
          console.error("Error fetching user data for analysis:", error)
          return {
            ...analysis,
            userDisplayName: "Anonymous User",
            userPhotoURL: null,
          }
        }
      })
    )

    return analysesWithUsers
  } catch (error: any) {
    console.error("Error getting recent analyses:", error)
    
    // If it's an index error, try without ordering
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log("Index not ready, fetching without ordering...")
      const q = query(
        collection(db, "analyses"),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisResult[]
      
      // Sort manually on client side and fetch user data
      const sortedResults = results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      const analysesWithUsers = await Promise.all(
        sortedResults.map(async (analysis) => {
          try {
            const userData = await getUserData(analysis.userId)
            return {
              ...analysis,
              userDisplayName: userData?.displayName || "Anonymous User",
              userPhotoURL: userData?.photoURL || null,
            }
          } catch (error) {
            console.error("Error fetching user data for analysis:", error)
            return {
              ...analysis,
              userDisplayName: "Anonymous User",
              userPhotoURL: null,
            }
          }
        })
      )

      return analysesWithUsers
    }
    
    throw error
  }
}

// Real-time recent analyses listener
export const subscribeToRecentAnalyses = (limitCount: number = 20, callback: (analyses: AnalysisResult[]) => void): Unsubscribe => {
  try {
    const q = query(
      collection(db, "analyses"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const analyses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalysisResult[]
      callback(analyses)
    }, (error: any) => {
      console.error("Error listening to recent analyses:", error)
      
      // Fallback for index errors
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log("Index not ready, using fallback query...")
        const fallbackQ = query(
          collection(db, "analyses"),
          limit(limitCount)
        )
        
        onSnapshot(fallbackQ, (querySnapshot) => {
          const analyses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AnalysisResult[]
          
          // Sort manually on client side
          const sortedAnalyses = analyses.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          callback(sortedAnalyses)
        }, (fallbackError) => {
          console.error("Fallback query also failed:", fallbackError)
          callback([])
        })
      } else {
        callback([])
      }
    })
  } catch (error) {
    console.error("Error setting up recent analyses listener:", error)
    callback([])
    return () => {}
  }
}

// Voting operations
export const saveUserVote = async (vote: Omit<UserVote, "createdAt">) => {
  try {
    const voteData = {
      ...vote,
      createdAt: new Date().toISOString(),
    }
    
    await addDoc(collection(db, "votes"), voteData)
    
    // Update analysis vote counts
    const analysisRef = doc(db, "analyses", vote.analysisId)
    const analysisDoc = await getDoc(analysisRef)
    
    if (analysisDoc.exists()) {
      const analysis = analysisDoc.data() as AnalysisResult
      const newVotes = {
        up: analysis.communityVotes.up + (vote.vote === "up" ? 1 : 0),
        down: analysis.communityVotes.down + (vote.vote === "down" ? 1 : 0),
      }
      
      await updateDoc(analysisRef, {
        communityVotes: newVotes,
      })
    }
  } catch (error) {
    console.error("Error saving user vote:", error)
    throw error
  }
}

export const getUserVote = async (userId: string, analysisId: string) => {
  try {
    const q = query(
      collection(db, "votes"),
      where("userId", "==", userId),
      where("analysisId", "==", analysisId)
    )
    
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const voteDoc = querySnapshot.docs[0]
      return voteDoc.data() as UserVote
    }
    return null
  } catch (error: any) {
    console.error("Error getting user vote:", error)
    
    // If it's an index error, try a different approach
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log("Index not ready, trying alternative query...")
      // Try to get all votes for the user and filter client-side
      const q = query(
        collection(db, "votes"),
        where("userId", "==", userId)
      )
      
      const querySnapshot = await getDocs(q)
      const userVote = querySnapshot.docs.find(doc => doc.data().analysisId === analysisId)
      return userVote ? userVote.data() as UserVote : null
    }
    
    throw error
  }
} 