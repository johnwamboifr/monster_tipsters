import PageHeader from "@/components/common/unified/PageHeader";

const ContactPage = () => (
  <div className="space-y-6">
    <PageHeader eyebrow="Contact" title="Get in touch" description="Questions about premium access or the football platform?" />
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">
      <p>Reach us at hello@monster-tipsters.com or call +254 708 048 110.</p>
    </div>
  </div>
);

export default ContactPage;
