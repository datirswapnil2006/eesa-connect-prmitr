import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMembershipSettings,
  updateMembershipSettings,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

const MembershipSettings = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMembershipSettings().then((data) => {
      if (data) {
        setEnabled(data.enabled);
        setFormUrl(data.form_url);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateMembershipSettings(enabled, formUrl);
      alert("Membership updated successfully");
    } catch (err) {
      alert("Update failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-700 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-semibold">
          Membership Settings
        </h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium">
          Enable Membership
        </span>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Google Form Link
        </label>
        <Input
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://forms.gle/..."
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default MembershipSettings;
