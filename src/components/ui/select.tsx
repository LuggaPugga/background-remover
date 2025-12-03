import { Select as SelectPrimitive } from "@kobalte/core/select";
import { CheckIcon, ChevronDownIcon } from "lucide-solid";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive;

type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
	class?: string;
	size?: "sm" | "default";
};

function SelectTrigger(props: SelectTriggerProps) {
	const [local, rest] = splitProps(props, ["class", "size", "children"]);
	return (
		<SelectPrimitive.Trigger
			class={cn(
				"border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			data-size={local.size ?? "default"}
			{...rest}
		>
			{local.children}
			<SelectPrimitive.Icon>
				<ChevronDownIcon class="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

type SelectValueProps<T> = ComponentProps<typeof SelectPrimitive.Value<T>>;

function SelectValue<T>(props: SelectValueProps<T>) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content> & {
	class?: string;
	position?: "popper" | "item-aligned";
};

function SelectContent(props: SelectContentProps) {
	const [local, rest] = splitProps(props, ["class", "position"]);
	const position = local.position ?? "popper";
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				class={cn(
					"bg-popover text-popover-foreground data-expanded:animate-in data-closed:animate-out data-closed:fade-out-0 data-expanded:fade-in-0 data-closed:zoom-out-95 data-expanded:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--kb-popper-content-available-height) min-w-32 origin-(--kb-popper-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
					position === "popper" &&
						"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					local.class,
				)}
				{...rest}
			>
				<SelectPrimitive.Listbox
					class={cn(
						"p-1",
						position === "popper" &&
							"h-(--kb-popper-trigger-height) w-full min-w-(--kb-popper-trigger-width) scroll-my-1",
					)}
				/>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label> & {
	class?: string;
};

function SelectLabel(props: SelectLabelProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<SelectPrimitive.Label
			class={cn("text-muted-foreground px-2 py-1.5 text-xs", local.class)}
			{...rest}
		/>
	);
}

type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item> & {
	class?: string;
};

function SelectItem(props: SelectItemProps) {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<SelectPrimitive.Item
			class={cn(
				"focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				local.class,
			)}
			{...rest}
		>
			<span class="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon class="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemLabel>{local.children}</SelectPrimitive.ItemLabel>
		</SelectPrimitive.Item>
	);
}

export {
	Select,
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
};
