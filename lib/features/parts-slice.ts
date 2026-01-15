import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Part {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  compatibility: string[]
  inStock: boolean
  brand?: string
  sku?: string
  weight?: string
  dimensions?: string
  material?: string
  warranty?: string
  specifications?: { label: string; value: string }[]
  features?: string[]
  installationDifficulty?: "Easy" | "Medium" | "Hard"
  installationTime?: string
  images?: string[]
  videos?: { title: string; url: string; thumbnail: string }[]
  relatedParts?: string[]
  reviews?: { author: string; rating: number; comment: string; date: string }[]
  // New fields for filtering
  vehicleModels?: string[]
  vehicleYears?: number[]
  partCategory?: string
}

interface PartsState {
  items: Part[]
  filteredItems: Part[]
  selectedCategory: string | null
  hasCategoryFilter: boolean
  filters: {
    year: string
    make: string
    model: string
    category: string
  }
}

const initialState: PartsState = {
  items: [
    {
      id: "1",
      name: "Performance Brake System",
      category: "Brakes",
      price: 1299.99,
      image: "/high-end-car-brake-disc-rotor-close-up-macro.jpg",
      description:
        "High-performance ceramic brake system for superior stopping power. Engineered for both track and street use, this brake system delivers exceptional performance in all conditions.",
      compatibility: ["Model S", "Model 3", "Range Rover Sport"],
      inStock: true,
      brand: "Brembo",
      sku: "BRK-PRM-001",
      weight: "12.5 kg",
      dimensions: "380mm x 36mm",
      material: "Carbon Ceramic",
      warranty: "3 Years / 60,000 km",
      specifications: [
        { label: "Disc Diameter", value: "380mm" },
        { label: "Disc Thickness", value: "36mm" },
        { label: "Caliper Pistons", value: "6-Piston" },
        { label: "Pad Compound", value: "Carbon Ceramic" },
        { label: "Max Temperature", value: "800°C" },
        { label: "Weight Reduction", value: "40% vs OEM" },
      ],
      features: [
        "Superior heat dissipation technology",
        "Reduced brake fade during aggressive driving",
        "Direct bolt-on fitment - no modifications required",
        "Includes stainless steel brake lines",
        "Cross-drilled and slotted rotors",
        "DOT4 compatible brake fluid recommended",
      ],
      installationDifficulty: "Medium",
      installationTime: "2-3 hours",
      images: [
        "/high-end-car-brake-disc-rotor-close-up-macro.jpg",
        "/brake-caliper-red-close-up.jpg",
        "/brake-pads-ceramic-detail.jpg",
        "/brake-system-installed-wheel.jpg",
      ],
      videos: [
        { title: "Installation Guide", url: "#", thumbnail: "/video-thumb-brake-install.jpg" },
        { title: "Brake Bedding Process", url: "#", thumbnail: "/video-thumb-brake-bedding.jpg" },
      ],
      relatedParts: ["2", "3"],
      reviews: [
        {
          author: "Mike R.",
          rating: 5,
          comment: "Incredible stopping power! Night and day difference from stock.",
          date: "Dec 10, 2025",
        },
        {
          author: "Sarah K.",
          rating: 5,
          comment: "Easy install with the included instructions. Performance is outstanding.",
          date: "Nov 28, 2025",
        },
        {
          author: "David M.",
          rating: 4,
          comment: "Great brakes, just wish they came in more colors.",
          date: "Nov 15, 2025",
        },
      ],
      vehicleModels: ["Model S", "Model 3", "Range Rover Sport"],
      vehicleYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      partCategory: "brakes",
    },
    {
      id: "2",
      name: "Carbon Fiber Intake Manifold",
      category: "Engine",
      price: 2499.99,
      image: "/carbon-fiber-engine-component-macro-photography.jpg",
      description:
        "Lightweight carbon fiber construction for enhanced airflow and improved throttle response. Precision engineered for maximum performance gains.",
      compatibility: ["Range Rover", "Discovery", "Defender"],
      inStock: true,
      brand: "APR",
      sku: "ENG-CFI-002",
      weight: "3.2 kg",
      dimensions: "450mm x 280mm x 120mm",
      material: "Carbon Fiber Composite",
      warranty: "2 Years / 40,000 km",
      specifications: [
        { label: "Material", value: "Pre-preg Carbon Fiber" },
        { label: "Weight Savings", value: "45% vs Stock" },
        { label: "Flow Increase", value: "+28%" },
        { label: "HP Gain", value: "+15-25 HP" },
        { label: "Torque Gain", value: "+18-22 lb-ft" },
        { label: "Finish", value: "Gloss Clear Coat" },
      ],
      features: [
        "Hand-laid carbon fiber construction",
        "Larger plenum volume for increased air capacity",
        "Optimized runner lengths for peak torque",
        "Integrated sensor ports",
        "Heat-resistant clear coat finish",
        "Direct OEM replacement - plug and play",
      ],
      installationDifficulty: "Hard",
      installationTime: "4-6 hours",
      images: [
        "/carbon-fiber-engine-component-macro-photography.jpg",
        "/intake-manifold-top-view.jpg",
        "/intake-manifold-installed.jpg",
      ],
      videos: [{ title: "Full Installation Tutorial", url: "#", thumbnail: "/video-thumb-intake-install.jpg" }],
      relatedParts: ["5"],
      reviews: [
        {
          author: "James T.",
          rating: 5,
          comment: "The throttle response improvement alone is worth it!",
          date: "Dec 5, 2025",
        },
        {
          author: "Lisa M.",
          rating: 5,
          comment: "Beautiful craftsmanship and noticeable power gains.",
          date: "Nov 20, 2025",
        },
      ],
      vehicleModels: ["Range Rover", "Discovery", "Defender"],
      vehicleYears: [2019, 2020, 2021, 2022, 2023, 2024],
      partCategory: "engine",
    },
    {
      id: "3",
      name: "Adaptive Suspension Kit",
      category: "Suspension",
      price: 3799.99,
      image: "/luxury-car-suspension-system-close-up.jpg",
      description:
        "Premium adaptive suspension system with real-time adjustment. Transform your ride with adjustable damping for comfort or performance.",
      compatibility: ["Model X", "Range Rover Velar"],
      inStock: true,
      brand: "KW Suspensions",
      sku: "SUS-ADP-003",
      weight: "28 kg (complete kit)",
      dimensions: "Variable",
      material: "Aircraft-grade Aluminum",
      warranty: "5 Years / 100,000 km",
      specifications: [
        { label: "Adjustment Range", value: "16 Levels" },
        { label: "Lowering Range", value: "25-50mm" },
        { label: "Spring Rate (Front)", value: "Variable 6-10 kg/mm" },
        { label: "Spring Rate (Rear)", value: "Variable 8-12 kg/mm" },
        { label: "Damper Type", value: "Twin-Tube" },
        { label: "Controller", value: "Bluetooth App" },
      ],
      features: [
        "Electronic damping control via smartphone app",
        "16 compression and 16 rebound settings",
        "Height-adjustable spring perches",
        "Corrosion-resistant coating",
        "TÜV certified",
        "Complete with all mounting hardware",
      ],
      installationDifficulty: "Hard",
      installationTime: "6-8 hours",
      images: [
        "/luxury-car-suspension-system-close-up.jpg",
        "/suspension-coilover-detail.jpg",
        "/suspension-app-control.jpg",
      ],
      videos: [
        { title: "Complete Installation Guide", url: "#", thumbnail: "/video-thumb-suspension-install.jpg" },
        { title: "App Setup Tutorial", url: "#", thumbnail: "/video-thumb-app-setup.jpg" },
      ],
      relatedParts: ["1", "6"],
      reviews: [
        {
          author: "Chris P.",
          rating: 5,
          comment: "The app control is a changer. Soft for daily, firm for weekends.",
          date: "Dec 12, 2025",
        },
      ],
      vehicleModels: ["Model X", "Range Rover Velar"],
      vehicleYears: [2020, 2021, 2022, 2023, 2024],
      partCategory: "suspension",
    },
    {
      id: "4",
      name: "Titanium Exhaust System",
      category: "Exhaust",
      price: 4299.99,
      image: "/titanium-car-exhaust-system-macro.jpg",
      description:
        "Lightweight titanium construction with optimized flow dynamics. Hand-crafted for the ultimate in sound and performance.",
      compatibility: ["Model S Plaid", "Range Rover Sport SVR"],
      inStock: false,
      brand: "Akrapovič",
      sku: "EXH-TIT-004",
      weight: "8.5 kg",
      dimensions: "Cat-back System",
      material: "Grade 1 Titanium",
      warranty: "2 Years / 40,000 km",
      specifications: [
        { label: "Material", value: "Grade 1 Titanium" },
        { label: "Weight Savings", value: "65% vs Stock" },
        { label: "Sound Level", value: "Sports (Valve Controlled)" },
        { label: "Tips", value: "Carbon Fiber 100mm" },
        { label: "HP Gain", value: "+12 HP" },
        { label: "Construction", value: "TIG Welded" },
      ],
      features: [
        "Valve-controlled sound system",
        "Aerospace-grade titanium",
        "Carbon fiber exhaust tips",
        "Hand-polished finish",
        "Dyno-tested performance gains",
        "ECU tune compatible",
      ],
      installationDifficulty: "Medium",
      installationTime: "3-4 hours",
      images: [
        "/titanium-car-exhaust-system-macro.jpg",
        "/exhaust-tips-carbon-detail.jpg",
        "/exhaust-system-undercar.jpg",
      ],
      videos: [
        { title: "Sound Comparison", url: "#", thumbnail: "/video-thumb-exhaust-sound.jpg" },
        { title: "Installation Guide", url: "#", thumbnail: "/video-thumb-exhaust-install.jpg" },
      ],
      relatedParts: ["2", "5"],
      reviews: [],
      vehicleModels: ["Model S Plaid", "Range Rover Sport SVR"],
      vehicleYears: [2021, 2022, 2023, 2024],
      partCategory: "exhaust",
    },
    {
      id: "5",
      name: "Performance Turbocharger",
      category: "Engine",
      price: 5499.99,
      image: "/turbocharger-turbine-close-up-metallic.jpg",
      description:
        "High-efficiency turbocharger for maximum power output. Precision-balanced and tested for reliability.",
      compatibility: ["Range Rover", "Discovery Sport"],
      inStock: true,
      brand: "Garrett",
      sku: "ENG-TRB-005",
      weight: "6.8 kg",
      dimensions: "280mm x 240mm x 220mm",
      material: "Inconel / Aluminum",
      warranty: "2 Years / 40,000 km",
      specifications: [
        { label: "Compressor Wheel", value: "62mm Billet" },
        { label: "Turbine Wheel", value: "56mm Inconel" },
        { label: "Bearing Type", value: "Dual Ball Bearing" },
        { label: "Max Boost", value: "28 PSI" },
        { label: "HP Potential", value: "450+ HP" },
        { label: "A/R Ratio", value: "0.82" },
      ],
      features: [
        "Dual ball bearing center housing",
        "Billet aluminum compressor wheel",
        "Inconel turbine wheel for durability",
        "Speed sensor port included",
        "Water and oil cooled",
        "Anti-surge compressor housing",
      ],
      installationDifficulty: "Hard",
      installationTime: "8-12 hours",
      images: [
        "/turbocharger-turbine-close-up-metallic.jpg",
        "/turbo-compressor-wheel-detail.jpg",
        "/turbo-installed-engine.jpg",
      ],
      videos: [{ title: "Professional Installation Guide", url: "#", thumbnail: "/video-thumb-turbo-install.jpg" }],
      relatedParts: ["2", "4"],
      reviews: [
        {
          author: "Tom H.",
          rating: 5,
          comment: "Incredible power gains. Professional install recommended.",
          date: "Dec 1, 2025",
        },
      ],
      vehicleModels: ["Range Rover", "Discovery Sport"],
      vehicleYears: [2019, 2020, 2021, 2022, 2023, 2024],
      partCategory: "engine",
    },
    {
      id: "6",
      name: "Lightweight Wheel Set",
      category: "Wheels",
      price: 3299.99,
      image: "/luxury-car-wheel-rim-close-up-silver.jpg",
      description:
        "Forged aluminum wheels with aerodynamic design. Reduce unsprung weight for improved handling and acceleration.",
      compatibility: ["Model 3", "Model Y", "Evoque"],
      inStock: true,
      brand: "BBS",
      sku: "WHL-FRG-006",
      weight: "8.2 kg per wheel",
      dimensions: "20x9 ET35",
      material: "Forged 6061-T6 Aluminum",
      warranty: "Lifetime Structural",
      specifications: [
        { label: "Size", value: "20x9 inches" },
        { label: "Offset", value: "ET35" },
        { label: "Bolt Pattern", value: "5x120" },
        { label: "Center Bore", value: "72.6mm" },
        { label: "Weight", value: "8.2 kg/wheel" },
        { label: "Finish", value: "Diamond Cut" },
      ],
      features: [
        "Flow-formed construction",
        "JWL/VIA certified",
        "Aerodynamic spoke design",
        "Hub-centric fitment",
        "Includes center caps",
        "TPMS compatible",
      ],
      installationDifficulty: "Easy",
      installationTime: "1 hour",
      images: ["/luxury-car-wheel-rim-close-up-silver.jpg", "/wheel-spoke-detail.jpg", "/wheels-on-car-side-view.jpg"],
      videos: [{ title: "Wheel Fitting Guide", url: "#", thumbnail: "/video-thumb-wheel-install.jpg" }],
      relatedParts: ["3"],
      reviews: [
        {
          author: "Alex W.",
          rating: 5,
          comment: "Beautiful wheels, perfect fitment. Noticeable handling improvement.",
          date: "Dec 8, 2025",
        },
        {
          author: "Emma S.",
          rating: 5,
          comment: "Light weight and stunning looks. Highly recommend!",
          date: "Nov 25, 2025",
        },
      ],
      vehicleModels: ["Model 3", "Model Y", "Evoque"],
      vehicleYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      partCategory: "wheels",
    }  ],
  filteredItems: [], // Will be set to in-stock items on first load
  selectedCategory: null,
  hasCategoryFilter: false,
  filters: {
    year: "",
    make: "",
    model: "",
    category: "",
  },
}

const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    filterByCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
      state.hasCategoryFilter = !!action.payload
      // Apply all current filters including category
      state.filteredItems = state.items.filter((item) => {
        // Check stock
        if (!item.inStock) return false

        // Check category filter
        if (action.payload && item.category !== action.payload) return false

        // Check advanced filters
        if (state.filters.year && item.vehicleYears && !item.vehicleYears.includes(parseInt(state.filters.year))) return false
        if (state.filters.make && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.make.toLowerCase()))) return false
        if (state.filters.model && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.model.toLowerCase()))) return false
        if (state.filters.category && item.partCategory !== state.filters.category) return false

        return true
      })
    },
    searchParts: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase()
      state.filteredItems = state.items.filter((item) => {
        // Check stock
        if (!item.inStock) return false

        // Check search query
        const matchesSearch = item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)

        if (!matchesSearch) return false

        // Check advanced filters
        if (state.filters.year && item.vehicleYears && !item.vehicleYears.includes(parseInt(state.filters.year))) return false
        if (state.filters.make && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.make.toLowerCase()))) return false
        if (state.filters.model && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.model.toLowerCase()))) return false
        if (state.filters.category && item.partCategory !== state.filters.category) return false

        return true
      })
    },
    setFilters: (state, action: PayloadAction<Partial<PartsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Apply all filters including advanced filters, category selection, and search
      state.filteredItems = state.items.filter((item) => {
        // Check stock
        if (!item.inStock) return false

        // Check selected category
        if (state.selectedCategory && item.category !== state.selectedCategory) return false

        // Check advanced filters
        if (state.filters.year && item.vehicleYears && !item.vehicleYears.includes(parseInt(state.filters.year))) return false
        if (state.filters.make && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.make.toLowerCase()))) return false
        if (state.filters.model && item.vehicleModels && !item.vehicleModels.some(model => model.toLowerCase().includes(state.filters.model.toLowerCase()))) return false
        if (state.filters.category && item.partCategory !== state.filters.category) return false

        return true
      })
    },
    clearFilters: (state) => {
      state.filters = {
        year: "",
        make: "",
        model: "",
        category: "",
      }
      state.selectedCategory = null
      state.hasCategoryFilter = false
      state.filteredItems = state.items.filter(item => item.inStock)
    },
  },
})

export const { filterByCategory, searchParts, setFilters, clearFilters } = partsSlice.actions
export default partsSlice.reducer
