"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle } from "lucide-react";

interface Account {
  email: string;
  startScreen: "admin" | "user";
  isValid: boolean;
  role: string | null;
}

export default function ManageAdminAccountPage() {
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push("/admin/login");
      return;
    }

    if (user) {
      loadAccounts();
    }
  }, [user, sessionLoading, router]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/authorized-accounts");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Access denied. Only hospital admins can access this page.", { 
            duration: 5000 
          });
          router.push("/admin");
          return;
        }
        throw new Error(data.error || "Failed to load accounts");
      }

      setAccounts(data.accounts || []);
    } catch (err) {
      console.error("Load accounts error:", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/authorized-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add account");
        return;
      }

      toast.success("Account added successfully");
      setNewEmail("");
      await loadAccounts();
    } catch (err) {
      console.error("Add account error:", err);
      toast.error("Failed to add account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from managers?`)) {
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/authorized-accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete account. Please try again.");
        return;
      }

      toast.success("Account removed successfully");
      await loadAccounts();
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartScreenChange = async (email: string, startScreen: "admin" | "user") => {
    const account = accounts.find((a) => a.email === email);

    if (!account?.isValid) {
      toast.error("Cannot change settings for invalid accounts");
      return;
    }

    try {
      const res = await fetch("/api/admin/authorized-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, startScreen }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update start screen");
        return;
      }

      // 로컬 상태 업데이트
      setAccounts((prev) =>
        prev.map((a) => (a.email === email ? { ...a, startScreen } : a))
      );
      toast.success("Start screen updated");
    } catch (err) {
      console.error("Update start screen error:", err);
      toast.error("Failed to update start screen");
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manager Account Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add or remove login accounts for this hospital
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Manager</h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter Gmail address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}
            />
            <button
              onClick={handleAdd}
              disabled={submitting || !newEmail.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Manager
            </button>
          </div>
        </div>

        {/* Account List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Registered Managers</h2>
            <p className="text-sm text-gray-500">{accounts.length} account(s)</p>
          </div>

          {accounts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No manager accounts registered yet
            </div>
          ) : (
            <div className="divide-y">
              {accounts.map((account) => (
                <div
                  key={account.email}
                  className={`p-6 ${
                    !account.isValid ? "bg-red-50 border-l-4 border-red-500" : ""
                  }`}
                >
                  {/* Email & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {account.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium text-gray-800">{account.email}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(account.email)}
                      disabled={submitting}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Invalid Account Warning */}
                  {!account.isValid && (
                    <div className="text-red-600 text-sm mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Account is not valid. This account does not exist in the system.
                    </div>
                  )}

                  {/* Start Screen Selection */}
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">App Start Screen:</span>
                    <label
                      className={`flex items-center gap-2 cursor-pointer ${
                        !account.isValid ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`startScreen-${account.email}`}
                        value="admin"
                        checked={account.startScreen === "admin"}
                        onChange={() => handleStartScreenChange(account.email, "admin")}
                        disabled={!account.isValid || submitting}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span className="text-sm">Admin Panel</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 cursor-pointer ${
                        !account.isValid ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`startScreen-${account.email}`}
                        value="user"
                        checked={account.startScreen === "user"}
                        onChange={() => handleStartScreenChange(account.email, "user")}
                        disabled={!account.isValid || submitting}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span className="text-sm">User Home</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
