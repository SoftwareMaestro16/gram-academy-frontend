import { useT } from "../i18n/useT";
import { format } from "../i18n/strings";

interface PriceTagProps {
  isPaid: boolean;
  priceStars: number;
  /** Server-computed price (== priceStars unless a referrer discount applies). */
  discountedPriceStars: number;
}

/**
 * Renders a course price from server-provided values only. When a discount is
 * present, shows the struck base price, the discounted price, and a -15% badge.
 * The client NEVER computes the discount — both figures come from the API.
 */
export function PriceTag({ isPaid, priceStars, discountedPriceStars }: PriceTagProps) {
  const { t } = useT();

  if (!isPaid || priceStars === 0) {
    return (
      <span className="text-sm font-medium text-success">{t.course.free}</span>
    );
  }

  const hasDiscount = discountedPriceStars < priceStars;

  if (hasDiscount) {
    return (
      <span className="flex items-center gap-1.5 text-sm">
        <span className="text-text-faint line-through">
          {format(t.course.stars, { n: priceStars })}
        </span>
        <span className="font-semibold text-text">
          {format(t.course.stars, { n: discountedPriceStars })}
        </span>
        <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-success">
          {t.course.discountBadge}
        </span>
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold text-text">
      {format(t.course.stars, { n: priceStars })}
    </span>
  );
}
