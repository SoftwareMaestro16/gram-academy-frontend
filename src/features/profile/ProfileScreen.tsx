import type { ReactNode } from "react";
import { Award, Moon, Star, Sun, Users, Wallet } from "lucide-react";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TonAttribution } from "../../components/Logo";
import { ErrorCard, SkeletonList } from "../../components/StateViews";
import { useT } from "../../i18n/useT";
import { localeShortLabels, LOCALES, type Locale } from "../../i18n/strings";
import { useMe, useUpdateLocaleMutation } from "../../api/queries";
import { useAppStore } from "../../state/useAppStore";
import { useEffectiveTheme } from "../../lib/useTheme";
import type { Theme } from "../../lib/theme";
import type { MeResponse } from "../../api/schemas";

function Avatar({ user }: { user: MeResponse["user"] }) {
  const initials =
    (user.firstName.charAt(0) + (user.lastName?.charAt(0) ?? "")).toUpperCase() ||
    "?";
  if (user.photoUrl) {
    return (
      <img
        src={user.photoUrl}
        alt=""
        className="h-16 w-16 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-semibold">
      {initials}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      {children}
    </div>
  );
}

function PlaceholderCard({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 font-medium">
        <span className="text-text-muted">{icon}</span>
        {title}
      </div>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </Card>
  );
}

export function ProfileScreen() {
  const { t, c, locale } = useT();
  const setLocale = useAppStore((s) => s.setLocale);
  const setThemeOverride = useAppStore((s) => s.setThemeOverride);
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
      <Card className="mt-6 space-y-4">
        <Field label={t.profile.language}>
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
        <Field label={t.profile.theme}>
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

      {/* Wave 2 placeholders */}
      <section className="mt-6 space-y-3">
        <PlaceholderCard
          icon={<Wallet className="h-4 w-4" />}
          title={c.wallet.connect}
          hint={t.profile.walletSoon}
        />
        <PlaceholderCard
          icon={<Users className="h-4 w-4" />}
          title={t.profile.referral}
          hint={t.profile.referralSoon}
        />
        <PlaceholderCard
          icon={<Award className="h-4 w-4" />}
          title={t.profile.certificates}
          hint={t.profile.certificatesSoon}
        />
      </section>

      {/* Built on TON attribution */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-faint">
        <span>{t.profile.builtOn}</span>
        <TonAttribution />
      </div>
    </Screen>
  );
}
