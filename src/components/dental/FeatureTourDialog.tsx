import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/dental/Button";
import { DirectionalIcon } from "@/components/DirectionalIcon";
import { useLanguage } from "@/context/LanguageContext";
import { useStore } from "@/context/StoreContext";
import { useDirectionalNavigation } from "@/hooks/use-directional-navigation";
import { cn } from "@/lib/utils";
import { FEATURE_TOUR_STEPS, type FeatureTourStep } from "@/data/featureTourSteps";
import {
  getFeatureTourSignInHref,
  hasCompletedFeatureTour,
  isFeatureTourExcludedPath,
  markFeatureTourCompleted,
  reportFeatureTourEvent,
} from "@/lib/featureTour";

const SHOW_DELAY_MS = 1100;

export function FeatureTourDialog() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAuthLoading } = useStore();
  const { t, isRtl } = useLanguage();
  const { actionForKey } = useDirectionalNavigation();

  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const hasEvaluatedRef = useRef(false);

  useEffect(() => {
    if (hasEvaluatedRef.current || isAuthLoading) return;
    hasEvaluatedRef.current = true;

    if (hasCompletedFeatureTour() || isFeatureTourExcludedPath(location.split("?")[0])) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (!isFeatureTourExcludedPath(window.location.pathname)) {
        setOpen(true);
        reportFeatureTourEvent({ type: "shown" });
      }
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
    // Only ever runs once, right after auth state first resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading]);

  const step = FEATURE_TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === FEATURE_TOUR_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const finishTour = () => {
    markFeatureTourCompleted();
    reportFeatureTourEvent({ type: "completed" });
    setOpen(false);
  };

  const skipTour = () => {
    markFeatureTourCompleted();
    reportFeatureTourEvent({ type: "skipped", atStepId: step.id });
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open) {
      markFeatureTourCompleted();
      reportFeatureTourEvent({ type: "skipped", atStepId: step.id });
    }
    setOpen(nextOpen);
  };

  const goNext = () => {
    if (isLastStep) {
      finishTour();
      return;
    }
    setDirection(1);
    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    if (isFirstStep) return;
    setDirection(-1);
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleCtaClick = (targetStep: FeatureTourStep) => {
    if (!targetStep.ctaHref) return;

    markFeatureTourCompleted();
    reportFeatureTourEvent({ type: "cta_clicked", stepId: targetStep.id, href: targetStep.ctaHref });
    setOpen(false);

    const destination =
      targetStep.requiresAuth && !isAuthenticated
        ? getFeatureTourSignInHref(targetStep.ctaHref)
        : targetStep.ctaHref;
    navigate(destination);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = actionForKey(event.key);
    if (!action) return;
    event.preventDefault();
    if (action === "next") goNext();
    else goBack();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir={isRtl ? "rtl" : "ltr"}
        aria-label={t("featureTour.dialogLabel")}
        onKeyDown={handleKeyDown}
        className="w-[calc(100vw-2rem)] max-w-[440px] gap-0 overflow-hidden rounded-[28px] border p-0 sm:max-w-[460px]"
        style={{
          borderColor: "var(--xd-gold-border-soft)",
          background: "var(--xd-surface-strong)",
          boxShadow: "var(--xd-shadow-strong)",
        }}
      >
        <div className="px-6 pb-2 pt-9 text-center sm:px-8">
          <span
            className="xd-gold-icon mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--xd-gold-bg-soft)", color: "var(--xd-gold-text)" }}
          >
            <step.Icon size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * (isRtl ? -18 : 18) }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * (isRtl ? 18 : -18) }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <DialogTitle
                className="font-display text-[21px] font-semibold leading-tight sm:text-[23px]"
                style={{ color: "var(--xd-text)" }}
              >
                {t(step.titleKey)}
              </DialogTitle>
              <DialogDescription
                className="mx-auto mt-3 max-w-[360px] text-[14px] leading-[22px]"
                style={{ color: "var(--xd-muted-2)" }}
              >
                {t(step.descriptionKey)}
              </DialogDescription>

              {step.ctaHref && step.ctaTextKey ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-5 gap-2 px-5"
                  onClick={() => handleCtaClick(step)}
                >
                  {t(step.ctaTextKey)}
                  <DirectionalIcon direction="forward" size={15} aria-hidden="true" />
                </Button>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 px-6" aria-hidden="true">
          {FEATURE_TOUR_STEPS.map((tourStep, index) => (
            <span
              key={tourStep.id}
              className={cn("h-1.5 rounded-full transition-all duration-200", index === stepIndex ? "w-6" : "w-1.5")}
              style={{ background: index === stepIndex ? "var(--xd-gold-active)" : "var(--xd-border)" }}
            />
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {t("featureTour.stepCounter", {
            values: { current: stepIndex + 1, total: FEATURE_TOUR_STEPS.length },
          })}
        </p>

        <div
          className="mt-6 flex items-center justify-between gap-3 border-t px-6 py-4 sm:px-8"
          style={{ borderColor: "var(--xd-border-soft)" }}
        >
          <button
            type="button"
            onClick={skipTour}
            className="rounded-full px-2 py-1.5 text-[13px] font-semibold transition-colors hover:text-[var(--xd-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xd-gold-focus-ring)]"
            style={{ color: "var(--xd-muted-2)" }}
          >
            {t("featureTour.skip")}
          </button>

          <span
            className="hidden text-[12px] font-medium sm:inline"
            style={{ color: "var(--xd-muted-2)" }}
          >
            {t("featureTour.stepCounter", {
              values: { current: stepIndex + 1, total: FEATURE_TOUR_STEPS.length },
            })}
          </span>

          <div className="flex items-center gap-2">
            {!isFirstStep ? (
              <Button type="button" variant="secondary" size="sm" className="gap-1.5 px-4" onClick={goBack}>
                <DirectionalIcon direction="back" size={15} aria-hidden="true" />
                {t("featureTour.back")}
              </Button>
            ) : null}
            <Button type="button" variant="primary" size="sm" className="gap-1.5 px-4" onClick={goNext}>
              {isLastStep ? t("featureTour.finish") : t("featureTour.next")}
              {!isLastStep ? <DirectionalIcon direction="forward" size={15} aria-hidden="true" /> : null}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
