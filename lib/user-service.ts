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
  } catch (error) {
    console.error("Error getting user analyses:", error)
    throw error
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisResult[]
  } catch (error) {
    console.error("Error getting recent analyses:", error)
    throw error
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
  } catch (error) {
    console.error("Error getting user vote:", error)
    throw error
  }
} 