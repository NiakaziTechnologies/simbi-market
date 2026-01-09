"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { LiveSearchResults } from "./live-search-results"

const years = Array.from({ length: 26 }, (_, i) => ({ value: (2025 - i).toString(), label: (2025 - i).toString() }))

const vehicleData = {
    makes: [
        { value: "bmw", label: "BMW" },
        { value: "mercedes", label: "Mercedes-Benz" },
        { value: "audi", label: "Audi" },
        { value: "toyota", label: "Toyota" },
        { value: "rangerover", label: "Range Rover" },
        { value: "landrover", label: "Land Rover" },
        { value: "porsche", label: "Porsche" },
        { value: "ford", label: "Ford" },
        { value: "volkswagen", label: "Volkswagen" },
        { value: "honda", label: "Honda" },
        { value: "nissan", label: "Nissan" },
        { value: "lexus", label: "Lexus" },
        { value: "chevrolet", label: "Chevrolet" },
    ],
    models: {
        bmw: ["3 Series", "5 Series", "X5", "M3", "M5", "X7"],
        mercedes: ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Wagon"],
        audi: ["A4", "A6", "Q5", "Q7", "RS6", "R8"],
        toyota: ["Camry", "Corolla", "Hilux", "Land Cruiser", "Supra", "RAV4"],
        rangerover: ["Sport", "Vogue", "Velar", "Evoque"],
        landrover: ["Defender", "Discovery"],
        porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
        ford: ["F-150", "Mustang", "Ranger", "Explorer"],
    },
    categories: [
        { value: "engine", label: "Engine Components" },
        { value: "brakes", label: "Brakes & Suspension" },
        { value: "transmission", label: "Transmission" },
        { value: "body", label: "Body Parts" },
        { value: "electrical", label: "Electrical" },
        { value: "exhaust", label: "Exhaust Systems" },
        { value: "cooling", label: "Cooling & Heating" },
        { value: "interior", label: "Interior Accessories" },
    ],
}

interface SearchableSelectProps {
    options: { value: string; label: string }[]
    placeholder: string
    value: string
    onValueChange: (value: string) => void
    className?: string
}

function SearchableSelect({ options, placeholder, value, onValueChange, className }: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12 rounded-none first:rounded-l-xl last:rounded-r-xl border-r-0 last:border-r transition-all",
                        className
                    )}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-[#0a0a0a] border-white/10 text-white z-[60]">
                <Command>
                    <CommandInput
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        className="h-9"
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty className="p-2 pt-0">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-accent hover:text-accent hover:bg-white/5"
                                onClick={() => {
                                    onValueChange(searchValue)
                                    setOpen(false)
                                }}
                            >
                                Use "{searchValue}"
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onValueChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                    className="hover:bg-white/10 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export function SearchFilters({ className }: { className?: string }) {
    const [year, setYear] = React.useState("")
    const [make, setMake] = React.useState("")
    const [model, setModel] = React.useState("")
    const [category, setCategory] = React.useState("")

    const modelOptions = React.useMemo(() => {
        if (!make) return []
        const models = vehicleData.models[make as keyof typeof vehicleData.models] || []
        return models.map(m => ({ value: m.toLowerCase().replace(/\s+/g, '-'), label: m }))
    }, [make])

    const showResults = !!(year || make || model || category)

    return (
        <div className="relative w-full">
            <div className={cn("grid grid-cols-2 md:grid-cols-4 w-full", className)}>
                <SearchableSelect
                    options={years}
                    placeholder="Year"
                    value={year}
                    onValueChange={setYear}
                />
                <SearchableSelect
                    options={vehicleData.makes}
                    placeholder="Make"
                    value={make}
                    onValueChange={(val) => {
                        setMake(val)
                        setModel("") // Reset model when make changes
                    }}
                />
                <SearchableSelect
                    options={modelOptions}
                    placeholder={make ? "Model" : "Select Make First"}
                    value={model}
                    onValueChange={setModel}
                />
                <SearchableSelect
                    options={vehicleData.categories}
                    placeholder="Category"
                    value={category}
                    onValueChange={setCategory}
                />
            </div>

            <LiveSearchResults
                isVisible={showResults}
                filters={{ year, make, model, category }}
            />
        </div>
    )
}
