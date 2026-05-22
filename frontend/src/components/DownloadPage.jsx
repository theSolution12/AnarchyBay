import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import { getPurchase, getDownloadUrls } from "@/services/purchase.service";
import NavBar from "./NavBar";
import toast from "react-hot-toast";

export default function DownloadPage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [purchase, setPurchase] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const purchaseData = await getPurchase(purchaseId);
        setPurchase(purchaseData);

        if (purchaseData.status !== "completed") {
          toast.error("Purchase not completed yet");
          return;
        }

        const downloadData = await getDownloadUrls(purchaseId);
        setFiles(downloadData.files || []);
      } catch (err) {
        toast.error(err.message || "Failed to load purchase");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [purchaseId, isAuthenticated, navigate]);

  const handleDownload = async (file) => {
    setDownloadingFile(file.fileId);
    try {
      const link = document.createElement("a");
      link.href = file.downloadUrl;
      link.download = file.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${file.fileName}`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="pt-24 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="pt-24 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Purchase not found</h2>
          <Link to="/library" className="text-violet-600 hover:underline mt-4 inline-block">
            Go to My Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-pink-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-lg font-medium">Purchase Complete!</span>
            </div>
            <h1 className="text-3xl font-bold">{purchase.products?.name || "Your Product"}</h1>
            <p className="text-white/80 mt-2">
              Thank you for your purchase. Download your files below.
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Your Files</h2>
              <span className="text-sm text-slate-500">{files.length} file(s)</span>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <p>No files available for download</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{file.fileName}</p>
                        <p className="text-sm text-slate-500">{formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingFile === file.fileId}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-60"
                    >
                      {downloadingFile === file.fileId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-medium text-amber-800">License Key</p>
                  <p className="text-sm text-amber-700 font-mono mt-1">{purchase.license_key}</p>
                  <p className="text-xs text-amber-600 mt-2">Keep this key safe. You may need it for product activation or support.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/library"
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium"
              >
                Go to My Library
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
