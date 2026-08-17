import { Link } from "react-router-dom";

const PageHeader = ({ eyebrow, title, description, actions, backTo }) => (
  <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.12)]">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {backTo ? (
          <Link to={backTo} className="mb-3 inline-flex text-sm text-emerald-300 hover:text-emerald-200">
            ← Back
          </Link>
        ) : null}
        {eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  </div>
);

export default PageHeader;
