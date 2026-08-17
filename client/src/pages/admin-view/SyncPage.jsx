import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PageHeader from "@/components/common/unified/PageHeader";
import { Button } from "@/components/ui/button";

import { fetchHomeData } from "@/features/slices/footballSlice";

const SyncPage = () => {
  const dispatch = useDispatch();

  const { home, loadingStatus } = useSelector((state) => state.football);

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Synchronization"
        title="Synchronization center"
        description="Monitor the health of the MySQL-backed football data"
      />

      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">
        <p className="text-white">
          Current dashboard summary:{" "}
          {loadingStatus
            ? "Loading..."
            : home?.statistics?.totalPredictions ??
              home?.statistics?.predictions ??
              0}{" "}
          published predictions
        </p>

        <Button className="mt-4 rounded-full">
          Run sync
        </Button>
      </div>
    </div>
  );
};

export default SyncPage;
