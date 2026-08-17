const ConfidenceBadge = ({ value }) => (
  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-200">
    {value ?? 86}% confidence
  </span>
);

export default ConfidenceBadge;
