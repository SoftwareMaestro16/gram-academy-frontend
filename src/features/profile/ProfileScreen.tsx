import { useState, type ReactNode } from "react";
import { Award, ChevronRight, Languages, Moon, Star, Sun } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { localeShortLabels, LOCALES, type Locale } from "../../i18n/strings";
import { useMe, useUpdateLocaleMutation } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import { useEffectiveTheme } from "../../lib/useTheme";
import type { Theme } from "../../lib/theme";
import type { MeResponse } from "../../api/schemas";
import { ReferralCard } from "./ReferralCard";

// A plain <img> (not a fetch()-based cache): Telegram's userpic CDN doesn't send permissive CORS
// headers, so fetch()ing it to build a blob cache silently fails and never renders — <img src>
// isn't subject to that restriction. onError covers both "no photoUrl" and "URL present but the
// image genuinely fails to load" with the same neutral initials fallback.
function Avatar({ user }: { user: MeResponse["user"] }) {
  const [failed, setFailed] = useState(false);
  const initials =
    (user.firstName.charAt(0) + (user.lastName?.charAt(0) ?? "")).toUpperCase() ||
    "?";
  if (user.photoUrl && !failed) {
    return (
      <img
        src={user.photoUrl}
        alt=""
        className="h-16 w-16 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-semibold text-text-muted">
      {initials}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2.5 text-sm font-medium text-text">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          {icon}
        </span>
        {label}
      </span>
      {children}
    </div>
  );
}

/** Links out to the dedicated Certificates tab (replaces the old dead-end
 *  "Finish a course to earn one" placeholder now that it has a real
 *  destination). */
function CertificatesLinkCard({ onOpen }: { onOpen: () => void }) {
  const { t } = useT();
  return (
    <Card onClick={onOpen}>
      <div className="flex items-center gap-3">
        <span className="text-text-muted">
          <Award className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{t.profile.certificates}</p>
          <p className="mt-0.5 text-sm text-text-muted">{t.profile.certificatesHint}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-faint" />
      </div>
    </Card>
  );
}

export function ProfileScreen() {
  const { t, locale } = useT();
  const setLocale = useAppStore((s) => s.setLocale);
  const setThemeOverride = useAppStore((s) => s.setThemeOverride);
  const setTab = useAppStore((s) => s.setTab);
  const theme = useEffectiveTheme();
  const { data: me, isPending, isError, refetch } = useMe();
  const updateLocale = useUpdateLocaleMutation();

  const onSelectLocale = (next: Locale) => {
    setLocale(next); // optimistic UI
    updateLocale.mutate(next);
  };

  if (isPending) {
    return (
      <Screen title={t.profile.title} withTabBar>
        <SkeletonList rows={4} />
      </Screen>
    );
  }
  if (isError || !me) {
    return (
      <Screen title={t.profile.title} withTabBar>
        <ErrorCard onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const { user } = me;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Screen title={t.profile.title} withTabBar>
      {/* Account */}
      <div className="flex items-center gap-4">
        <Avatar user={user} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{fullName}</h2>
            {user.isPremium && (
              <Badge tone="accent">
                <Star className="h-3 w-3" />
                {t.profile.premium}
              </Badge>
            )}
          </div>
          {user.username && (
            <p className="text-sm text-text-muted">@{user.username}</p>
          )}
        </div>
      </div>

      {me.referredByReferralCode !== null && (
        <p className="mt-3 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
          {t.profile.discountReminder}
        </p>
      )}

      {/* Settings: language + theme */}
      <section className="mt-4 xs:mt-6">
        <h2 className="mb-2 text-sm font-semibold text-text-muted">
          {t.profile.preferences}
        </h2>
        <Card className="divide-y divide-border">
          <Field label={t.profile.language} icon={<Languages className="h-4 w-4" />}>
            <SegmentedControl<Locale>
              ariaLabel={t.profile.language}
              className="w-40"
              options={LOCALES.map((loc) => ({
                value: loc,
                label: localeShortLabels[loc],
              }))}
              value={locale}
              onChange={onSelectLocale}
            />
          </Field>
          <Field
            label={t.profile.theme}
            icon={
              theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            }
          >
            <SegmentedControl<Theme>
              ariaLabel={t.profile.theme}
              className="w-28"
              options={[
                { value: "light", label: <Sun className="mx-auto h-4 w-4" /> },
                { value: "dark", label: <Moon className="mx-auto h-4 w-4" /> },
              ]}
              value={theme}
              onChange={(next) => setThemeOverride(next)}
            />
          </Field>
        </Card>
      </section>

      {/* Referral (wallet connect/disconnect now lives in the header) */}
      <section className="mt-4 space-y-3 xs:mt-6">
        <ReferralCard hasWallet={me.wallet !== null} />
        <CertificatesLinkCard onOpen={() => setTab("certificates")} />
      </section>
    </Screen>
  );
}
