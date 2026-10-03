package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"github.com/rs/cors"
)

// ═══════════════════════════════════════════════════════════════════
// ShambaPoint Climate — Go Geo-Spatial Microservice
// Handles: farm boundary calculations, NDVI stub, centroid math,
//          area computation, aerial tracking metadata
// Port: 5001
// ═══════════════════════════════════════════════════════════════════

// ─── Models ──────────────────────────────────────────────────────
type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type FarmPlot struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	FarmerID  string   `json:"farmer_id"`
	County    string   `json:"county"`
	Crop      string   `json:"crop"`
	Polygon   []LatLng `json:"polygon"`
	Centroid  LatLng   `json:"centroid"`
	AreaHa    float64  `json:"area_ha"`
	NDVIScore float64  `json:"ndvi_score"`
	Health    string   `json:"health"`
	RiskScore int      `json:"risk_score"`
}

type NDVIResponse struct {
	PlotID     string  `json:"plot_id"`
	Date       string  `json:"date"`
	NDVI       float64 `json:"ndvi"`
	Health     string  `json:"health"`
	HealthPct  int     `json:"health_pct"`
	WaterStress bool   `json:"water_stress"`
	Note       string  `json:"note"`
}

type GeoResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error,omitempty"`
}

// ─── Demo farm plots (Kenya GPS coordinates) ─────────────────────
var demoPlots = []FarmPlot{
	{
		ID: "plot-001", Name: "Wanjiru Farm – Plot A1", FarmerID: "farmer-001",
		County: "Kirinyaga", Crop: "Maize",
		Polygon: []LatLng{
			{-0.628, 37.376}, {-0.624, 37.376}, {-0.624, 37.382},
			{-0.628, 37.382}, {-0.628, 37.376},
		},
		Centroid: LatLng{-0.626, 37.379}, AreaHa: 1.2,
		NDVIScore: 0.72, Health: "good", RiskScore: 32,
	},
	{
		ID: "plot-002", Name: "Wanjiru Farm – Plot A2 (Beans)", FarmerID: "farmer-001",
		County: "Kirinyaga", Crop: "Beans",
		Polygon: []LatLng{
			{-0.622, 37.376}, {-0.619, 37.376}, {-0.619, 37.381},
			{-0.622, 37.381}, {-0.622, 37.376},
		},
		Centroid: LatLng{-0.6205, 37.3785}, AreaHa: 0.9,
		NDVIScore: 0.58, Health: "fair", RiskScore: 55,
	},
	{
		ID: "plot-003", Name: "Kipchoge Tea Block 1", FarmerID: "farmer-002",
		County: "Kericho", Crop: "Tea",
		Polygon: []LatLng{
			{-0.372, 35.278}, {-0.368, 35.278}, {-0.368, 35.284},
			{-0.372, 35.284}, {-0.372, 35.278},
		},
		Centroid: LatLng{-0.370, 35.281}, AreaHa: 2.0,
		NDVIScore: 0.85, Health: "excellent", RiskScore: 14,
	},
	{
		ID: "plot-004", Name: "Amina Tomato Field", FarmerID: "farmer-003",
		County: "Garissa", Crop: "Tomatoes",
		Polygon: []LatLng{
			{-0.458, 39.643}, {-0.454, 39.643}, {-0.454, 39.649},
			{-0.458, 39.649}, {-0.458, 39.643},
		},
		Centroid: LatLng{-0.456, 39.646}, AreaHa: 1.2,
		NDVIScore: 0.44, Health: "fair", RiskScore: 72,
	},
	{
		ID: "plot-005", Name: "Nakuru Wheat Block", FarmerID: "farmer-004",
		County: "Nakuru", Crop: "Wheat",
		Polygon: []LatLng{
			{-0.282, 36.062}, {-0.276, 36.062}, {-0.276, 36.070},
			{-0.282, 36.070}, {-0.282, 36.062},
		},
		Centroid: LatLng{-0.279, 36.066}, AreaHa: 3.5,
		NDVIScore: 0.79, Health: "good", RiskScore: 28,
	},
	{
		ID: "plot-006", Name: "Kitui Drought-Risk Plot", FarmerID: "farmer-005",
		County: "Kitui", Crop: "Sorghum",
		Polygon: []LatLng{
			{-1.367, 38.008}, {-1.362, 38.008}, {-1.362, 38.014},
			{-1.367, 38.014}, {-1.367, 38.008},
		},
		Centroid: LatLng{-1.3645, 38.011}, AreaHa: 1.8,
		NDVIScore: 0.31, Health: "poor", RiskScore: 88,
	},
}

// ─── Geo math helpers ─────────────────────────────────────────────

// Haversine distance in km
func haversine(a, b LatLng) float64 {
	const R = 6371.0
	dLat := (b.Lat - a.Lat) * math.Pi / 180
	dLng := (b.Lng - a.Lng) * math.Pi / 180
	sinLat := math.Sin(dLat / 2)
	sinLng := math.Sin(dLng / 2)
	a2 := sinLat*sinLat + math.Cos(a.Lat*math.Pi/180)*math.Cos(b.Lat*math.Pi/180)*sinLng*sinLng
	return R * 2 * math.Atan2(math.Sqrt(a2), math.Sqrt(1-a2))
}

// Shoelace area in m²
func polygonAreaM2(poly []LatLng) float64 {
	n := len(poly)
	if n < 3 { return 0 }
	area := 0.0
	for i := 0; i < n; i++ {
		j := (i + 1) % n
		latI := poly[i].Lat * math.Pi / 180
		latJ := poly[j].Lat * math.Pi / 180
		lngDiff := (poly[j].Lng - poly[i].Lng) * math.Pi / 180
		area += lngDiff * (2 + math.Sin(latI) + math.Sin(latJ))
	}
	return math.Abs(area * 6371000 * 6371000 / 2)
}

func ndviToHealth(ndvi float64) string {
	switch {
	case ndvi >= 0.75: return "excellent"
	case ndvi >= 0.55: return "good"
	case ndvi >= 0.35: return "fair"
	default:           return "poor"
	}
}

// ─── Handlers ─────────────────────────────────────────────────────

func corsHeaders(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
}

func jsonResp(w http.ResponseWriter, code int, data interface{}) {
	corsHeaders(w)
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}

// GET /geo/plots — all demo farm plots with aerial tracking metadata
func handlePlots(w http.ResponseWriter, r *http.Request) {
	farmerID := r.URL.Query().Get("farmer_id")
	county   := r.URL.Query().Get("county")

	var result []FarmPlot
	for _, p := range demoPlots {
		if (farmerID == "" || p.FarmerID == farmerID) &&
		   (county == "" || p.County == county) {
			result = append(result, p)
		}
	}
	if result == nil { result = []FarmPlot{} }

	jsonResp(w, 200, GeoResponse{
		Success: true,
		Data: map[string]interface{}{
			"plots": result,
			"total": len(result),
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"note": "Sample pilot data — not live GPS tracking",
		},
	})
}

// GET /geo/ndvi/:plotId — simulated NDVI for a plot
func handleNDVI(w http.ResponseWriter, r *http.Request) {
	plotID := r.URL.Path[len("/geo/ndvi/"):]
	if plotID == "" {
		jsonResp(w, 400, GeoResponse{Success: false, Error: "plot_id required"})
		return
	}

	var plot *FarmPlot
	for i := range demoPlots {
		if demoPlots[i].ID == plotID {
			plot = &demoPlots[i]
			break
		}
	}
	if plot == nil {
		jsonResp(w, 404, GeoResponse{Success: false, Error: "Plot not found"})
		return
	}

	// Simulate NDVI with small daily variation
	hour    := float64(time.Now().Hour())
	jitter  := (math.Sin(hour) * 0.04)
	ndvi    := math.Max(0.1, math.Min(0.95, plot.NDVIScore+jitter))
	health  := ndviToHealth(ndvi)

	jsonResp(w, 200, GeoResponse{
		Success: true,
		Data: NDVIResponse{
			PlotID:      plot.ID,
			Date:        time.Now().UTC().Format("2006-01-02"),
			NDVI:        math.Round(ndvi*100) / 100,
			Health:      health,
			HealthPct:   int(ndvi * 100),
			WaterStress: ndvi < 0.4,
			Note:        "Simulated Sentinel-2 NDVI. In production: pull from Copernicus EO API.",
		},
	})
}

// POST /geo/area — compute polygon area in hectares
func handleArea(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Polygon []LatLng `json:"polygon"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || len(body.Polygon) < 3 {
		jsonResp(w, 400, GeoResponse{Success: false, Error: "polygon with ≥3 points required"})
		return
	}
	m2 := polygonAreaM2(body.Polygon)
	jsonResp(w, 200, GeoResponse{
		Success: true,
		Data: map[string]interface{}{
			"area_m2": math.Round(m2),
			"area_ha": math.Round(m2/10000*100) / 100,
			"area_acres": math.Round(m2/4046.86*100) / 100,
		},
	})
}

// GET /geo/distance — distance between two points in km
func handleDistance(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	var a, b LatLng
	fmt.Sscanf(q.Get("lat1"), "%f", &a.Lat)
	fmt.Sscanf(q.Get("lng1"), "%f", &a.Lng)
	fmt.Sscanf(q.Get("lat2"), "%f", &b.Lat)
	fmt.Sscanf(q.Get("lng2"), "%f", &b.Lng)
	dist := haversine(a, b)
	jsonResp(w, 200, GeoResponse{
		Success: true,
		Data: map[string]interface{}{
			"distance_km": math.Round(dist*100) / 100,
			"note": "Haversine great-circle distance",
		},
	})
}

// GET /geo/health — microservice health
func handleHealth(w http.ResponseWriter, r *http.Request) {
	jsonResp(w, 200, map[string]interface{}{
		"status":  "ok",
		"service": "ShambaPoint Geo Microservice (Go)",
		"version": "1.0.0",
		"uptime":  time.Now().UTC().Format(time.RFC3339),
	})
}

// ─── Main ─────────────────────────────────────────────────────────
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/geo/health",  handleHealth)
	mux.HandleFunc("/geo/plots",   handlePlots)
	mux.HandleFunc("/geo/ndvi/",   handleNDVI)
	mux.HandleFunc("/geo/area",    handleArea)
	mux.HandleFunc("/geo/distance",handleDistance)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:5000"},
		AllowedMethods: []string{"GET","POST","OPTIONS"},
		AllowedHeaders: []string{"Content-Type","Authorization"},
	})

	port := os.Getenv("GEO_PORT")
	if port == "" { port = "5001" }

	log.Printf("🗺️  ShambaPoint Geo Microservice (Go) → http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(mux)))
}
