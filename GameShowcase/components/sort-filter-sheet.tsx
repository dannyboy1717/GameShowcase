import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GameStatus } from "@/app/types/supabase";

export type SortOption = "dateAdded" | "alphabetical" | "dateStarted" | "dateFinished" | "rating";
export type SortDirection = "asc" | "desc";
export type FilterOption = "All" | GameStatus;

export const sortOptions: { value: SortOption; label: string }[] = [
    { value: "dateAdded", label: "Date Added" },
    { value: "alphabetical", label: "A-Z" },
    { value: "dateStarted", label: "Date Started" },
    { value: "dateFinished", label: "Date Finished" },
    { value: "rating", label: "Rating" },
];

export const filterOptions: FilterOption[] = [
    "All",
    "Plan to Play",
    "Started",
    "Finished",
    "Completed",
    "Continuous",
    "Paused",
    "Dropped",
];

export const DEFAULT_SORT: SortOption = "dateAdded";
export const DEFAULT_DIRECTION: SortDirection = "asc";
export const DEFAULT_FILTER: FilterOption = "All";

/** One-line summary of the active options, shown on the trigger button. */
export function describeSortFilter(sortBy: SortOption, sortDirection: SortDirection, filterBy: FilterOption): string {
    const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? "Date Added";
    const arrow = sortDirection === "asc" ? "↑" : "↓";

    return filterBy === "All" ? `${sortLabel} ${arrow}` : `${sortLabel} ${arrow} · ${filterBy}`;
}

type OptionRowProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

function OptionRow({ label, selected, onPress }: OptionRowProps) {
    return (
        <Pressable
            className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
                selected ? "bg-indigo-50 dark:bg-indigo-500/20" : ""
            }`}
            onPress={onPress}
        >
            <Text
                className={`text-base ${
                    selected ? "font-semibold text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-white"
                }`}
            >
                {label}
            </Text>
            {selected ? <Ionicons name="checkmark" size={20} color="#6366f1" /> : null}
        </Pressable>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="mb-6">
            <Text className="px-1 mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {title}
            </Text>
            <View className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">{children}</View>
        </View>
    );
}

type SortFilterSheetProps = {
    visible: boolean;
    onClose: () => void;
    sortBy: SortOption;
    onSortByChange: (value: SortOption) => void;
    sortDirection: SortDirection;
    onSortDirectionChange: (value: SortDirection) => void;
    filterBy: FilterOption;
    onFilterByChange: (value: FilterOption) => void;
};

export default function SortFilterSheet({
    visible,
    onClose,
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
    filterBy,
    onFilterByChange,
}: SortFilterSheetProps) {
    const isDefault = sortBy === DEFAULT_SORT && sortDirection === DEFAULT_DIRECTION && filterBy === DEFAULT_FILTER;

    function reset() {
        onSortByChange(DEFAULT_SORT);
        onSortDirectionChange(DEFAULT_DIRECTION);
        onFilterByChange(DEFAULT_FILTER);
    }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={["top", "left", "right", "bottom"]}>
                <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <Pressable onPress={reset} disabled={isDefault} hitSlop={8}>
                        <Text className={`text-base ${isDefault ? "text-gray-300 dark:text-gray-600" : "text-indigo-600 dark:text-indigo-400"}`}>
                            Reset
                        </Text>
                    </Pressable>

                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">Sort & Filter</Text>

                    <Pressable onPress={onClose} hitSlop={8}>
                        <Text className="text-base font-semibold text-indigo-600 dark:text-indigo-400">Done</Text>
                    </Pressable>
                </View>

                <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
                    <Section title="Sort by">
                        {sortOptions.map((option) => (
                            <OptionRow
                                key={option.value}
                                label={option.label}
                                selected={sortBy === option.value}
                                onPress={() => onSortByChange(option.value)}
                            />
                        ))}
                    </Section>

                    <Section title="Order">
                        <OptionRow
                            label="Ascending"
                            selected={sortDirection === "asc"}
                            onPress={() => onSortDirectionChange("asc")}
                        />
                        <OptionRow
                            label="Descending"
                            selected={sortDirection === "desc"}
                            onPress={() => onSortDirectionChange("desc")}
                        />
                    </Section>

                    <Section title="Status">
                        {filterOptions.map((option) => (
                            <OptionRow
                                key={option}
                                label={option}
                                selected={filterBy === option}
                                onPress={() => onFilterByChange(option)}
                            />
                        ))}
                    </Section>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}
