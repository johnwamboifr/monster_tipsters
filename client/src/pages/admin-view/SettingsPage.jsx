import PageHeader from "@/components/common/unified/PageHeader";

const SettingsPage = () => (
  <div className="space-y-6">
    <PageHeader eyebrow="Settings" title="Platform settings" description="Administration settings for the unified football hub" />
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">
      Configure synchronized data preferences, prediction publishing rules, and platform appearance here.
    </div>
  </div>
);

export default SettingsPage;
