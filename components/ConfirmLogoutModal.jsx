// components/ConfirmLogoutModal.jsx

import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useState } from "react";
import Spinner from "./Spinner";

export default function ConfirmLogoutModal({ open, setOpen }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-md p-6 text-center border border-white/20">
          <Dialog.Title className="text-lg font-semibold mb-4">Are you sure you want to logout?</Dialog.Title>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-400/60 hover:bg-red-500/70 rounded-xl text-white transition flex items-center gap-2"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading && <Spinner />}
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
