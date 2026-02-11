<script setup lang="ts">
import type { DateValue } from "@internationalized/date"
import type { DateRange } from "reka-ui"
import type { Grid } from "reka-ui/date"
import type { Ref } from "vue"

import {
  CalendarDate,
  isEqualMonth,
  today,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "@internationalized/date"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next"
import { RangeCalendarRoot, useDateFormatter } from "reka-ui"
import { createMonth, toDate } from "reka-ui/date"
import { ref, watch } from "vue"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
} from "@/components/ui/range-calendar"

const emit = defineEmits(["apply"])

const locale = ref("en-US")
const formatter = useDateFormatter(locale.value)

const value = ref({
  start: new CalendarDate(2025, 1, 10),
  end: new CalendarDate(2025, 1, 20),
}) as Ref<DateRange>

const placeholder = ref(value.value.start) as Ref<DateValue>
const secondMonthPlaceholder = ref(value.value.end) as Ref<DateValue>

const firstMonth = ref(
  createMonth({
    dateObj: placeholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

const secondMonth = ref(
  createMonth({
    dateObj: secondMonthPlaceholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

function updateMonth(reference: "first" | "second", months: number) {
  if (reference === "first")
    placeholder.value = placeholder.value.add({ months })
  else
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({ months })
}

watch(placeholder, (_placeholder) => {
  firstMonth.value = createMonth({
    dateObj: _placeholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(secondMonthPlaceholder.value, _placeholder)) {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({ months: 1 })
  }
})

watch(secondMonthPlaceholder, (_secondMonthPlaceholder) => {
  secondMonth.value = createMonth({
    dateObj: _secondMonthPlaceholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(_secondMonthPlaceholder, placeholder.value))
    placeholder.value = placeholder.value.subtract({ months: 1 })
})

watch(value, (newValue) => {
  if (newValue.start && newValue.end) {
    emit("apply", {
      from: toDate(newValue.start),
      to: toDate(newValue.end),
    })
  }
})

/**
 * Preset date ranges
 */
function setPreset(preset: string) {
  const now = today("UTC")
  let start: CalendarDate
  let end: CalendarDate

  switch (preset) {
    case "today":
      start = now
      end = now
      break
    case "this_week":
      start = startOfWeek(now, locale.value)
      end = endOfWeek(now, locale.value)
      break
    case "this_month":
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case "prev_month":
      const prevMonth = now.subtract({ months: 1 })
      start = startOfMonth(prevMonth)
      end = endOfMonth(prevMonth)
      break
    default:
      return
  }

  value.value = { start, end }
  placeholder.value = start
  secondMonthPlaceholder.value = end
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )
        "
      >
        <Calendar class="mr-2 h-4 w-4" />
        <template v-if="value.start">
          <template v-if="value.end">
            {{
              formatter.custom(toDate(value.start), {
                dateStyle: 'medium',
              })
            }}
            -
            {{
              formatter.custom(toDate(value.end), {
                dateStyle: 'medium',
              })
            }}
          </template>
          <template v-else>
            {{
              formatter.custom(toDate(value.start), {
                dateStyle: 'medium',
              })
            }}
          </template>
        </template>
        <template v-else>
          Pick a date
        </template>
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-auto p-3">
      <!-- 🔹 Preset Buttons -->
      <div class="flex flex-wrap gap-2 mb-3">
        <Button size="sm" variant="outline" @click="setPreset('today')">Today</Button>
        <Button size="sm" variant="outline" @click="setPreset('this_week')">This Week</Button>
        <Button size="sm" variant="outline" @click="setPreset('this_month')">This Month</Button>
        <Button size="sm" variant="outline" @click="setPreset('prev_month')">Previous Month</Button>
      </div>

      <RangeCalendarRoot v-slot="{ weekDays }" v-model="value" v-model:placeholder="placeholder">
        <div class="flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0 mt-4">
          <!-- First Month -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <button
                :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
                @click="updateMonth('first', -1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <div class="text-sm font-medium">
                {{ formatter.fullMonthAndYear(toDate(firstMonth.value)) }}
              </div>
              <button
                :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
                @click="updateMonth('first', 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>

            <RangeCalendarGrid>
              <RangeCalendarGridHead>
                <RangeCalendarGridRow>
                  <RangeCalendarHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="w-full"
                  >
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody>
                <RangeCalendarGridRow
                  v-for="(weekDates, index) in firstMonth.rows"
                  :key="`weekDate-${index}`"
                  class="mt-2 w-full"
                >
                  <RangeCalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                  >
                    <RangeCalendarCellTrigger
                      :day="weekDate"
                      :month="firstMonth.value"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>

          <!-- Second Month -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <button
                :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
                @click="updateMonth('second', -1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <div class="text-sm font-medium">
                {{ formatter.fullMonthAndYear(toDate(secondMonth.value)) }}
              </div>
              <button
                :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')"
                @click="updateMonth('second', 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>

            <RangeCalendarGrid>
              <RangeCalendarGridHead>
                <RangeCalendarGridRow>
                  <RangeCalendarHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="w-full"
                  >
                    {{ day }}
                  </RangeCalendarHeadCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridHead>
              <RangeCalendarGridBody>
                <RangeCalendarGridRow
                  v-for="(weekDates, index) in secondMonth.rows"
                  :key="`weekDate-${index}`"
                  class="mt-2 w-full"
                >
                  <RangeCalendarCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                  >
                    <RangeCalendarCellTrigger
                      :day="weekDate"
                      :month="secondMonth.value"
                    />
                  </RangeCalendarCell>
                </RangeCalendarGridRow>
              </RangeCalendarGridBody>
            </RangeCalendarGrid>
          </div>
        </div>
      </RangeCalendarRoot>
    </PopoverContent>
  </Popover>
</template>
