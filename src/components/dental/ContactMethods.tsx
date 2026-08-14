import { useEffect, useRef, useState } from "react";
import { Building2, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { PremiumAccentIcon } from "@/components/dental/PremiumAccentIcon";
import { useLanguage } from "@/context/LanguageContext";

export const XDENTAL_GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/8nHcgy3pM56rfD9D7?g_st=aw";

type ContactDetail = {
  label?: string;
  value?: string;
  valueKey?: string;
  href?: string;
  external?: boolean;
  direction?: "ltr" | "auto";
};

type ContactMethod = {
  id: "call" | "email" | "whatsapp" | "visit";
  Icon: LucideIcon;
  title: string;
  details: ContactDetail[];
  action?: {
    labelKey: string;
    href: string;
    external?: boolean;
  };
};

export const CONTACT_METHODS: readonly ContactMethod[] = [
  {
    id: "call",
    Icon: Phone,
    title: "Call Us",
    details: [
      { label: "Main Support", value: "01552229405", href: "tel:+201552229405", direction: "ltr" },
      { label: "Office Landline", value: "0223955981", href: "tel:+20223955981", direction: "ltr" },
    ],
  },
  {
    id: "email",
    Icon: Mail,
    title: "Email Us",
    details: [
      {
        value: "contact@dentora-x.com",
        href: "mailto:contact@dentora-x.com",
        direction: "ltr",
      },
    ],
  },
  {
    id: "whatsapp",
    Icon: MessageCircle,
    title: "WhatsApp Support",
    details: [
      {
        label: "Orders WhatsApp",
        value: "01035777335",
        href: "https://wa.me/201035777335",
        external: true,
        direction: "ltr",
      },
    ],
  },
  {
    id: "visit",
    Icon: Building2,
    title: "Visit / Warehouse",
    details: [
      {
        valueKey: "contactPage.cardSubtitles.Location Address",
        value: "18 St Gheet Al Eda - Abdeen - Cairo",
        direction: "auto",
      },
    ],
    action: {
      labelKey: "contactPage.openInGoogleMaps",
      href: XDENTAL_GOOGLE_MAPS_URL,
      external: true,
    },
  },
] as const;

export function ContactMethods() {
  const { t } = useLanguage();
  const [revealedCard, setRevealedCard] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (cardsRef.current?.contains(event.target as Node)) return;
      setRevealedCard(null);
      if (
        document.activeElement instanceof HTMLElement &&
        cardsRef.current?.contains(document.activeElement)
      ) document.activeElement.blur();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  return (
    <div ref={cardsRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CONTACT_METHODS.map(({ id, Icon, title: titleFallback, details, action }) => {
        const isRevealed = revealedCard === id;
        const title = t(`contactPage.actions.${titleFallback}`, { fallback: titleFallback });

        return (
          <article
            key={id}
            tabIndex={0}
            role="group"
            aria-label={title}
            aria-expanded={isRevealed}
            data-flipped={isRevealed ? "true" : "false"}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && !(event.target as HTMLElement).closest("a")) {
                event.preventDefault();
              }
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "mouse" || (event.target as HTMLElement).closest("a")) return;
              const nextRevealed = isRevealed ? null : id;
              setRevealedCard(nextRevealed);
              if (!nextRevealed) event.currentTarget.blur();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setRevealedCard(null);
                event.currentTarget.blur();
                return;
              }
              if (event.target !== event.currentTarget || !["Enter", " "].includes(event.key)) return;
              event.preventDefault();
              if (isRevealed) event.currentTarget.blur();
              setRevealedCard(isRevealed ? null : id);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setRevealedCard((current) => (current === id ? null : current));
              }
            }}
            className="contact-method-card group relative h-[170px] cursor-pointer rounded-[14px] [perspective:1000px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xd-gold-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--xd-bg)]"
          >
            <div className="contact-method-card__inner relative h-full w-full">
              <div className="contact-method-card__front absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border border-[var(--xd-gold-border-soft)] bg-white/75 px-4 py-5 text-center shadow-[0_8px_22px_rgba(5,5,5,0.03)]">
                <span className="xd-icon-amber xd-icon-card-surface flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--xd-gold-bg-soft)]">
                  <PremiumAccentIcon icon={Icon} size={18} strokeWidth={2.2} />
                </span>
                <span className="mt-3 text-[13px] font-semibold text-[#050505]">{title}</span>
              </div>

              <div className="contact-method-card__back absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border border-[var(--xd-gold-border-soft)] bg-white/95 px-4 py-4 text-center shadow-[0_8px_22px_rgba(5,5,5,0.03)]">
                <div className="flex max-w-full flex-col items-center gap-2">
                  {details.map((detail) => {
                    const value = detail.valueKey
                      ? t(detail.valueKey, { fallback: detail.value ?? "" })
                      : detail.value ?? "";
                    const content = (
                      <>
                        {detail.label && (
                          <span className="block font-semibold text-[#3A3A3A]">
                            {t(`contactPage.contactLabels.${detail.label}`, { fallback: detail.label })}
                          </span>
                        )}
                        <span dir={detail.direction ?? "auto"} className="block max-w-full break-words">
                          {value}
                        </span>
                      </>
                    );

                    return detail.href ? (
                      <a
                        key={value}
                        href={detail.href}
                        target={detail.external ? "_blank" : undefined}
                        rel={detail.external ? "noopener noreferrer" : undefined}
                        className="rounded-[8px] px-2 text-[12px] leading-[18px] text-[#717182] transition hover:text-[#050505] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xd-gold-border)]"
                      >
                        {content}
                      </a>
                    ) : (
                      <p key={value} className="max-w-full text-[12px] leading-[19px] text-[#5F5F5F]">
                        {content}
                      </p>
                    );
                  })}
                </div>

                {action && (
                  <a
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    className="mt-3 inline-flex rounded-full border border-[var(--xd-gold-border)] bg-[var(--xd-gold-bg-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--xd-gold-text)] transition hover:border-[var(--xd-gold-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xd-gold-border)]"
                  >
                    {t(action.labelKey)}
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
