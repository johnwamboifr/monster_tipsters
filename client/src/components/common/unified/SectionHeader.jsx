const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p> : null}
      <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

export default SectionHeader;
