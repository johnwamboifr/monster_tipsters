import PageHeader from "@/components/common/unified/PageHeader";
import EmptyState from "@/components/common/unified/EmptyState";

const JackpotsPage = () => (
  <div className="space-y-6">
    <PageHeader eyebrow="Jackpots" title="Jackpots" description="Coming soon as part of the unified football platform" />
    <EmptyState title="Coming soon" message="Jackpot features will be introduced soon with shared fixtures and predictions." />
  </div>
);

export default JackpotsPage;
