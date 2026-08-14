import {
  Banknote,
  Heart,
  LifeBuoy,
  PackageCheck,
  PackageSearch,
  Sparkles,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type FeatureTourStep = {
  id: string;
  Icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  ctaTextKey?: string;
  /** Real, existing in-app route the CTA navigates to. */
  ctaHref?: string;
  /** True when the destination route requires a signed-in customer. */
  requiresAuth?: boolean;
};

// Verified against src/App.tsx routing and each page's live implementation
// before being added here — do not add a step whose ctaHref/feature isn't
// actually reachable by a real customer today.
export const FEATURE_TOUR_STEPS: FeatureTourStep[] = [
  {
    id: "welcome",
    Icon: Sparkles,
    titleKey: "featureTour.steps.welcome.title",
    descriptionKey: "featureTour.steps.welcome.description",
  },
  {
    id: "delivery",
    Icon: Truck,
    titleKey: "featureTour.steps.delivery.title",
    descriptionKey: "featureTour.steps.delivery.description",
    ctaTextKey: "featureTour.steps.delivery.cta",
    ctaHref: "/shipping-delivery",
  },
  {
    id: "payment",
    Icon: Banknote,
    titleKey: "featureTour.steps.payment.title",
    descriptionKey: "featureTour.steps.payment.description",
    ctaTextKey: "featureTour.steps.payment.cta",
    ctaHref: "/how-to-order",
  },
  {
    id: "rewards",
    Icon: Wallet,
    titleKey: "featureTour.steps.rewards.title",
    descriptionKey: "featureTour.steps.rewards.description",
    ctaTextKey: "featureTour.steps.rewards.cta",
    ctaHref: "/account/wallet",
    requiresAuth: true,
  },
  {
    id: "productRequest",
    Icon: PackageSearch,
    titleKey: "featureTour.steps.productRequest.title",
    descriptionKey: "featureTour.steps.productRequest.description",
    ctaTextKey: "featureTour.steps.productRequest.cta",
    ctaHref: "/account/product-requests",
    requiresAuth: true,
  },
  {
    id: "trackOrder",
    Icon: PackageCheck,
    titleKey: "featureTour.steps.trackOrder.title",
    descriptionKey: "featureTour.steps.trackOrder.description",
    ctaTextKey: "featureTour.steps.trackOrder.cta",
    ctaHref: "/track-order",
  },
  {
    id: "wishlist",
    Icon: Heart,
    titleKey: "featureTour.steps.wishlist.title",
    descriptionKey: "featureTour.steps.wishlist.description",
    ctaTextKey: "featureTour.steps.wishlist.cta",
    ctaHref: "/account/wishlist",
    requiresAuth: true,
  },
  {
    id: "support",
    Icon: LifeBuoy,
    titleKey: "featureTour.steps.support.title",
    descriptionKey: "featureTour.steps.support.description",
    ctaTextKey: "featureTour.steps.support.cta",
    ctaHref: "/contact",
  },
];
