"use client"

import { Check, ChevronsUpDown, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CourseItem } from "@/features/course/types"

type CourseMultiComboboxProps = {
  courses: CourseItem[]
  value: string[]
  onChange: (courseIds: string[]) => void
  disabled?: boolean
}

export function CourseMultiCombobox({
  courses,
  value,
  onChange,
  disabled = false,
}: CourseMultiComboboxProps) {
  const [open, setOpen] = useState(false)

  const titleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const course of courses) {
      map.set(course.id, course.title)
    }
    return map
  }, [courses])

  const selectedSet = useMemo(() => new Set(value), [value])

  function toggleCourse(courseId: string) {
    if (selectedSet.has(courseId)) {
      onChange(value.filter((id) => id !== courseId))
    } else {
      onChange([...value, courseId])
    }
  }

  function removeCourse(courseId: string) {
    onChange(value.filter((id) => id !== courseId))
  }

  return (
    <div className="CourseMultiCombobox flex flex-col gap-2">
      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-input bg-muted/40 px-2 py-1 text-xs"
            >
              <span className="truncate">{titleById.get(id) ?? id}</span>
              <button
                type="button"
                className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Gỡ khóa học"
                disabled={disabled}
                onClick={() => removeCourse(id)}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-8 w-full justify-between py-1.5 font-normal"
            disabled={disabled || courses.length === 0}
          >
            <span className="truncate text-left text-muted-foreground">
              {courses.length === 0
                ? "Không có khóa học"
                : "Tìm và chọn khóa học..."}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="CourseMultiComboboxPopover w-[min(100vw-2rem,28rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm khóa học..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy khóa học.</CommandEmpty>
              <CommandGroup heading="Khóa học">
                {courses.map((course) => {
                  const selected = selectedSet.has(course.id)
                  return (
                    <CommandItem
                      key={course.id}
                      value={`${course.title} ${course.id}`}
                      onSelect={() => {
                        toggleCourse(course.id)
                      }}
                    >
                      <Check
                        className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
                        aria-hidden
                      />
                      <span className="truncate">{course.title}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
