"use client";

import {
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrophyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "@/components/auth-provider";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
      rounded-[28px]

      bg-white

      p-4

      shadow-sm

      ring-1
      ring-zinc-100
    "
    >
      <div
        className="
        flex

        h-11
        w-11

        items-center
        justify-center

        rounded-2xl

        bg-[#c29cf2]/10

        text-[#c29cf2]
      "
      >
        {icon}
      </div>

      <div className="mt-4 text-xs text-zinc-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold text-zinc-900">
        {value}
      </div>
    </div>
  );
}

export default function RatingPage() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="p-6 text-sm text-zinc-500">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">
          Личный рейтинг
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Войдите,
          чтобы увидеть
          показатели
        </p>
      </div>
    );
  }

  return (
    <div
      className="
      min-h-screen

      bg-zinc-50

      p-5

      space-y-5
    "
    >
      <div>
        <h1
          className="
          text-2xl
          font-bold

          text-zinc-900
        "
        >
          Личный рейтинг
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Репутация
          и показатели
          работы
        </p>
      </div>

      <div
        className="
        relative

        overflow-hidden

        rounded-[32px]

        bg-gradient-to-br
        from-[#c29cf2]
        to-[#d8baf8]

        p-6

        text-white
      "
      >
        <div
          className="
          absolute

          -top-12
          -right-12

          h-36
          w-36

          rounded-full

          bg-white/10
        "
        />

        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-white/80">
              Текущий рейтинг
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="
                flex

                h-12
                w-12

                items-center
                justify-center

                rounded-2xl

                bg-white/15
              "
              >
                <StarIcon className="h-6 w-6" />
              </div>

              <div className="text-5xl font-bold">
                —
              </div>
            </div>
          </div>

          <div
            className="
            rounded-2xl

            bg-white/15

            px-4
            py-2

            text-sm
          "
          >
            Скоро API
          </div>
        </div>

        <div
          className="
          mt-6

          rounded-2xl

          bg-white/10

          p-4
        "
        >
          <div className="text-sm text-white/70">
            Статус
          </div>

          <div className="mt-2 flex items-center gap-2 font-medium">
            <ShieldCheckIcon className="h-5 w-5" />

            Новый сотрудник
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Выполнено смен"
          value="—"
          icon={
            <CheckCircleIcon className="h-5 w-5" />
          }
        />

        <StatCard
          label="Опоздания"
          value="—"
          icon={
            <ClockIcon className="h-5 w-5" />
          }
        />

        <StatCard
          label="Отмены"
          value="—"
          icon={
            <XCircleIcon className="h-5 w-5" />
          }
        />

        <StatCard
          label="Достижения"
          value="—"
          icon={
            <TrophyIcon className="h-5 w-5" />
          }
        />
      </div>

      <div
        className="
        rounded-[28px]

        bg-white

        p-5

        shadow-sm

        ring-1
        ring-zinc-100
      "
      >
        <div className="text-base font-semibold text-zinc-900">
          Как формируется рейтинг
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex gap-3">
            <StarIcon
              className="
              h-5
              w-5

              text-[#c29cf2]
            "
            />

            <div className="text-sm text-zinc-600">
              Оценки после
              завершения смен
            </div>
          </div>

          <div className="flex gap-3">
            <CheckCircleIcon
              className="
              h-5
              w-5

              text-[#c29cf2]
            "
            />

            <div className="text-sm text-zinc-600">
              Количество
              завершённых смен
            </div>
          </div>

          <div className="flex gap-3">
            <ClockIcon
              className="
              h-5
              w-5

              text-[#c29cf2]
            "
            />

            <div className="text-sm text-zinc-600">
              Опоздания
              и отмены
              влияют
              на рейтинг
            </div>
          </div>
        </div>

        <div
          className="
          mt-5

          rounded-2xl

          bg-zinc-50

          p-4

          text-xs

          text-zinc-500
        "
        >
          Реальные данные
          появятся после
          подключения API
        </div>
      </div>
    </div>
  );
}