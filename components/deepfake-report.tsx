
import { DeepfakeAnalysisResponse } from "@/lib/deepfake-api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DeepfakeReportProps {
  report: DeepfakeAnalysisResponse;
}

export function DeepfakeReport({ report }: DeepfakeReportProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Analysis Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Input Details</h3>
          <p>
            <span className="font-medium">Input Type:</span> {report.input_type}
          </p>
          <p>
            <span className="font-medium">Input Content:</span>{" "}
            {report.input_content}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
          <p>{report.analysis_summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Verdict</h3>
          <Badge
            className={`text-lg px-3 py-1 ${ report.verdict === "Fake"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {report.verdict}
          </Badge>
          <p className="mt-2">
            <span className="font-medium">Confidence Score:</span>{" "}
            {report.confidence_score}%
          </p>
        </div>

        {report.credibility_proof && report.credibility_proof.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Credibility Proof</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Verified</TableHead>
                  <TableHead>Matched Fact</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.credibility_proof.map((proof, index) => (
                  <TableRow key={index}>
                    <TableCell>{proof.claim_verified}</TableCell>
                    <TableCell>{proof.matched_fact}</TableCell>
                    <TableCell>
                      <a
                        href={proof.source_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Link
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {report.evidence && report.evidence.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Evidence</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Title</TableHead>
                  <TableHead>Reputation Score</TableHead>
                  <TableHead>Similarity Score</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Source URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.evidence.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.source_title}</TableCell>
                    <TableCell>{item.reputation_score}%</TableCell>
                    <TableCell>{item.similarity_score}%</TableCell>
                    <TableCell>{item.summary}</TableCell>
                    <TableCell>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Link
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
