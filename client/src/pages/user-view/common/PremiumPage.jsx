import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchTips } from "@/features/slices/tipsSlice";

import PageHeader from "@/components/common/unified/PageHeader";
import TipCard from "@/components/common/unified/TipCard";
import LoadingSkeleton from "@/components/common/unified/LoadingSkeleton";
import EmptyState from "@/components/common/unified/EmptyState";
import ErrorState from "@/components/common/ErrorState";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  CheckCircle2,
  Zap,
  Crown,
} from "lucide-react";

import { motion } from "framer-motion";

import subscriptionPlans from "@/config/subscriptions";

import ImageHero from "@/components/common/ImageHero";
import ImageSection from "@/components/common/ImageSection";

import "@/components/common/image-utilities.css";

import workImage from "@/assets/pexels-work2survive-32545253.jpg";
import footballImage from "@/assets/pexels-srijonism-12537018.jpg";

const PremiumPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================================
  // TIPS STATE
  // ============================================================

  const tips = useSelector(
    (state) => state.tips?.list || []
  );

  const loading = useSelector(
    (state) => state.tips?.status === "pending"
  );

  const error = useSelector(
    (state) => state.tips?.error
  );

  // ============================================================
  // AUTH STATE
  // ============================================================

  const { userType } = useSelector(
    (state) => state.auth
  );

  // ============================================================
  // PREMIUM ACCESS
  // ============================================================
  //
  // Current application access:
  //
  // VIP   -> Premium
  // ADMIN -> Premium
  //
  // The backend should ultimately determine access
  // based on the user's actual subscription plan.
  //
  // ============================================================

  const hasAccess =
    userType === "vip" ||
    userType === "admin";

  // ============================================================
  // FETCH TIPS
  // ============================================================

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    dispatch(fetchTips());
  }, [dispatch, hasAccess]);

  // ============================================================
  // SELECT SUBSCRIPTION PLAN
  // ============================================================

  const handleSelectPlan = (plan) => {
    navigate("/payment", {
      state: {
        planId: plan.id,
        amount: plan.amount,
        plan: plan.name,
      },
    });
  };

  // ============================================================
  // VIEW TIP DETAILS
  // ============================================================

  const handleViewTip = (tip) => {
    if (!tip?.id) {
      return;
    }

    navigate(`/tips/${tip.id}`);
  };

  // ============================================================
  // SUBSCRIPTION PAGE
  // ============================================================

  if (!hasAccess) {
    return (
      <div className="space-y-6">

        {/* ======================================================
            HERO
        ====================================================== */}

        <ImageHero
          backgroundImage={footballImage}
          title="Unlock Elite Football Tips"
          subtitle="Join hundreds of successful bettors with our premium subscription plans"
          overlay={0.65}
          height="h-52 sm:h-64 md:h-72 lg:h-80"
          contentPosition="center"
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">

            <Badge
              className="
                bg-emerald-500/20
                text-emerald-300
                border-emerald-500/30
                text-xs sm:text-sm
              "
            >
              Expert Picks
            </Badge>

            <Badge
              className="
                bg-blue-500/20
                text-blue-300
                border-blue-500/30
                text-xs sm:text-sm
              "
            >
              Daily Analysis
            </Badge>

            <Badge
              className="
                bg-purple-500/20
                text-purple-300
                border-purple-500/30
                text-xs sm:text-sm
              "
            >
              VIP Access
            </Badge>

          </div>
        </ImageHero>

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <PageHeader
          eyebrow="Premium"
          title="Choose Your Subscription"
          description="
            Unlock premium tips, expert match analysis,
            VIP betting slips, and exclusive daily picks
            by subscribing to one of our plans.
          "
        />

        {/* ======================================================
            PREMIUM BENEFITS
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          viewport={{
            once: true,
          }}
          className="space-y-4 mb-6"
        >

          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>

              <p
                className="
                  text-xs
                  sm:text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  sm:tracking-[0.2em]
                  text-slate-400
                "
              >
                Premium Benefits
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  sm:text-xl
                  font-bold
                  text-white
                "
              >
                What You'll Get
              </h2>

            </div>
          </div>

          <div
            className="
              grid
              gap-3
              sm:gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {/* Professional Analysis */}

            <ImageSection
              image={workImage}
              title="Professional Analysis"
              description="
                Get deep tactical analysis and match
                breakdowns from experienced tipsters.
              "
              badges={[
                "Professional",
                "Expert",
              ]}
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            />

            {/* Daily Predictions */}

            <ImageSection
              image={footballImage}
              title="Daily Tips"
              description="
                Receive fresh, carefully selected football
                tips every single day.
              "
              badges={[
                "Daily",
                "Verified",
              ]}
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            />

            {/* VIP */}

            <motion.div
              whileHover={{
                scale: 1.02,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                h-56
                sm:h-64
                md:h-72
                lg:h-64
                cursor-pointer
                bg-gradient-to-br
                from-emerald-500/20
                to-teal-600/20
                border
                border-emerald-500/30
                flex
                items-center
                justify-center
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  transition-all
                  duration-300
                  group-hover:opacity-75
                "
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
                }}
              />

              <div
                className="
                  relative
                  z-10
                  text-center
                  p-4
                  sm:p-6
                  text-white
                "
              >

                <Crown
                  className="
                    h-10
                    sm:h-12
                    w-10
                    sm:w-12
                    mx-auto
                    mb-2
                    sm:mb-3
                    text-amber-400
                  "
                />

                <h3
                  className="
                    text-base
                    sm:text-lg
                    font-bold
                  "
                >
                  VIP Exclusive
                </h3>

                <p
                  className="
                    text-xs
                    text-slate-200
                    mt-1
                    sm:mt-2
                  "
                >
                  Premium tips and exclusive selections
                  for active subscribers.
                </p>

                <Badge
                  className="
                    mt-2
                    sm:mt-3
                    bg-amber-500/30
                    text-amber-300
                    border-amber-500/30
                    text-xs
                  "
                >
                  Premium Only
                </Badge>

              </div>

            </motion.div>

          </div>

        </motion.section>

        {/* ======================================================
            SUBSCRIPTION PLANS
        ====================================================== */}

        <div
          className="
            grid
            gap-3
            sm:gap-4
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >

          {subscriptionPlans.map((plan) => (

            <Card
              key={plan.id}
              className={`
                border
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-emerald-400/30
                ${
                  plan.featured
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-white/10 bg-slate-900/80"
                }
              `}
            >

              <CardHeader
                className="
                  space-y-2
                  sm:space-y-3
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    items-start
                    sm:items-center
                    justify-between
                    gap-2
                  "
                >

                  <CardTitle
                    className="
                      text-base
                      sm:text-lg
                      font-semibold
                      text-white
                    "
                  >
                    {plan.name}
                  </CardTitle>

                  {plan.featured && (
                    <Badge
                      className="
                        border-emerald-400/30
                        bg-emerald-500/20
                        text-emerald-200
                        text-xs
                        sm:text-sm
                      "
                    >
                      Most Popular
                    </Badge>
                  )}

                </div>

                <CardDescription
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-400
                  "
                >
                  {plan.duration}
                </CardDescription>

                <div
                  className="
                    text-2xl
                    sm:text-3xl
                    font-semibold
                    text-white
                  "
                >
                  ${Number(plan.amount || 0).toLocaleString()}
                </div>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-slate-400
                  "
                >
                  {plan.description}
                </p>

              </CardHeader>

              <CardContent
                className="
                  space-y-3
                  sm:space-y-4
                "
              >

                <ul
                  className="
                    space-y-1
                    sm:space-y-2
                    text-xs
                    sm:text-sm
                    text-slate-300
                  "
                >

                  {plan.features.map((feature) => (

                    <li
                      key={feature}
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >

                      <CheckCircle2
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-emerald-400
                          mt-0.5
                        "
                      />

                      <span>
                        {feature}
                      </span>

                    </li>

                  ))}

                </ul>

                <Separator
                  className="bg-white/10"
                />

                <Button
                  className="
                    w-full
                    rounded-full
                    bg-emerald-600
                    text-white
                    hover:bg-emerald-500
                    text-xs
                    sm:text-sm
                    py-2
                    sm:py-2.5
                  "
                  onClick={() =>
                    handleSelectPlan(plan)
                  }
                >

                  <Zap
                    className="
                      mr-2
                      h-3
                      w-3
                      sm:h-4
                      sm:w-4
                    "
                  />

                  Choose Plan

                </Button>

              </CardContent>

            </Card>

          ))}

        </div>

        {/* ======================================================
            WHY SUBSCRIBE
        ====================================================== */}

        <Card
          className="
            border
            border-white/10
            bg-slate-900/80
          "
        >

          <CardContent
            className="
              flex
              flex-col
              sm:flex-row
              items-start
              gap-3
              sm:gap-4
              py-4
              sm:py-6
            "
          >

            <Crown
              className="
                mt-0.5
                h-5
                w-5
                sm:h-6
                sm:w-6
                text-emerald-400
                shrink-0
              "
            />

            <div className="w-full">

              <h3
                className="
                  font-semibold
                  text-white
                  text-base
                  sm:text-lg
                "
              >
                Why subscribe?
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  sm:text-sm
                  text-slate-400
                "
              >
                Get daily premium tips, exclusive analysis,
                and VIP betting selections as soon as your
                subscription is verified.
              </p>

            </div>

          </CardContent>

        </Card>

      </div>
    );
  }

  // ============================================================
  // PREMIUM TIPS PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      <PageHeader
        eyebrow="Premium"
        title="Premium Tips"
        description="
          Exclusive football tips and match insights
          reserved for active subscribers.
        "
      />

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <LoadingSkeleton count={6} />
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {!loading && error && (
        <ErrorState
          title="Unable to load premium tips"
          message={error}
          onRetry={() =>
            dispatch(fetchTips())
          }
        />
      )}

      {/* ========================================================
          TIPS
      ======================================================== */}

      {!loading &&
        !error &&
        tips.length > 0 && (
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            {tips.map((tip) => (

              <TipCard
                key={tip.id}
                tip={tip}
                onViewDetails={handleViewTip}
              />

            ))}

          </div>
        )}

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {!loading &&
        !error &&
        tips.length === 0 && (
          <EmptyState
            title="No premium tips available"
            message="
              Premium tips will appear here once
              they are published.
            "
          />
        )}

    </div>
  );
};

export default PremiumPage;
