// ============================================================================
//  Jasmine & Adrian's Dining Passport — data layer
//  Seeded with 71 hand-verified NYC Restaurant Week Summer 2026 restaurants
//  (real Google/Yelp ratings where confirmable; null = unverified, never faked).
//
//  TO REACH ALL ~600:  drop a restaurants.json next to index.html shaped like
//  the objects below (name, cuisine, neighborhood, borough, rating, reviews,
//  yelp, price, why). The app auto-loads and merges it over this seed on boot.
// ============================================================================

export const HOME = { name: "New York City", lat: 40.7128, lng: -74.006 };

// cuisine string -> { country, flag, region, lat, lng }
export const CMAP = {
  "Modern American":            { c:"United States", f:"🇺🇸", r:"The Americas" },
  "American":                   { c:"United States", f:"🇺🇸", r:"The Americas" },
  "New American":               { c:"United States", f:"🇺🇸", r:"The Americas" },
  "New American / Mediterranean":{ c:"United States", f:"🇺🇸", r:"The Americas" },
  "American / gastropub":       { c:"United States", f:"🇺🇸", r:"The Americas" },
  "Steakhouse":                 { c:"United States", f:"🇺🇸", r:"The Americas" },
  "Seafood":                    { c:"United States", f:"🇺🇸", r:"The Americas" },
  "Steakhouse/Chinese fusion":  { c:"United States", f:"🇺🇸", r:"The Americas" },
  "Indian":                     { c:"India", f:"🇮🇳", r:"Asia" },
  "Filipino":                   { c:"Philippines", f:"🇵🇭", r:"Asia" },
  "Japanese":                   { c:"Japan", f:"🇯🇵", r:"Asia" },
  "Japanese izakaya":           { c:"Japan", f:"🇯🇵", r:"Asia" },
  "Asian noodles":              { c:"Korea", f:"🇰🇷", r:"Asia" },
  "Thai":                       { c:"Thailand", f:"🇹🇭", r:"Asia" },
  "Szechuan Chinese":           { c:"China", f:"🇨🇳", r:"Asia" },
  "Italian":                    { c:"Italy", f:"🇮🇹", r:"Europe" },
  "Italian/Wine Bar":           { c:"Italy", f:"🇮🇹", r:"Europe" },
  "Italian Steakhouse/Seafood": { c:"Italy", f:"🇮🇹", r:"Europe" },
  "Italian-American":           { c:"Italy", f:"🇮🇹", r:"Europe" },
  "French":                     { c:"France", f:"🇫🇷", r:"Europe" },
  "French Bistro":              { c:"France", f:"🇫🇷", r:"Europe" },
  "French/Mediterranean":       { c:"France", f:"🇫🇷", r:"Europe" },
  "French/Alsatian":            { c:"France", f:"🇫🇷", r:"Europe" },
  "French-American bistro":     { c:"France", f:"🇫🇷", r:"Europe" },
  "French-Indonesian":          { c:"Indonesia", f:"🇮🇩", r:"Asia" },
  "Greek":                      { c:"Greece", f:"🇬🇷", r:"Europe" },
  "Mexican":                    { c:"Mexico", f:"🇲🇽", r:"The Americas" },
  "Peruvian":                   { c:"Peru", f:"🇵🇪", r:"The Americas" },
  "Latin American":             { c:"Latin America", f:"🌎", r:"The Americas" },
  "Brazilian steakhouse":       { c:"Brazil", f:"🇧🇷", r:"The Americas" },
  "Mediterranean":              { c:"Mediterranean", f:"🫒", r:"Europe" },
  "Modern European/Caribbean":  { c:"Caribbean", f:"🌴", r:"The Americas" },
  "European / Contemporary":    { c:"Europe", f:"🇪🇺", r:"Europe" },
  "Moroccan/French":            { c:"Morocco", f:"🇲🇦", r:"Africa" },
  "Turkish":                    { c:"Turkey", f:"🇹🇷", r:"Middle East" }
};

// country -> [lat, lng] centroid for the globe
export const COUNTRY_COORDS = {
  "United States":[39.5,-98.35], "India":[22.5,79], "Philippines":[13,122],
  "Japan":[36.2,138.2], "Korea":[36.5,127.8], "Thailand":[15.8,101],
  "China":[35.8,104.1], "Italy":[42.8,12.8], "France":[46.6,2.3],
  "Indonesia":[-2.5,118], "Greece":[39.1,22.9], "Mexico":[23.6,-102.5],
  "Peru":[-9.2,-75], "Latin America":[-14,-60], "Brazil":[-10.3,-53],
  "Mediterranean":[35.5,18], "Caribbean":[18.2,-77.3], "Europe":[50,10],
  "Morocco":[31.8,-7], "Turkey":[39,35.2], "Worldwide":[20,0]
};

export const REGION_ORDER = ["Europe","Asia","The Americas","Middle East","Africa"];

export const SEED = [
  {name:"Arvine",cuisine:"Modern American",neighborhood:"West Village",borough:"Manhattan",rating:4.8,reviews:85,yelp:null,price:"$$$",why:"Buzzy 2025 debut; bison tartare and duck-liver hush puppies in the old Quality Eats space."},
  {name:"Dhamaka",cuisine:"Indian",neighborhood:"Lower East Side",borough:"Manhattan",rating:4.5,reviews:3165,yelp:null,price:"$$$",why:"Unapologetic regional Indian; bold, fiery goat and heritage dishes — a cult hit."},
  {name:"Naks",cuisine:"Filipino",neighborhood:"East Village",borough:"Manhattan",rating:4.7,reviews:null,yelp:null,price:"$$$",why:"18-course kamayan feast eaten by hand; standout Kanto fried chicken."},
  {name:"The Noortwyck",cuisine:"French Bistro",neighborhood:"West Village",borough:"Manhattan",rating:4.6,reviews:null,yelp:null,price:"$$$",why:"EMP alums; seasonal New American, superb pastas and a serious wine list."},
  {name:"Wayan",cuisine:"French-Indonesian",neighborhood:"Nolita",borough:"Manhattan",rating:4.4,reviews:1000,yelp:null,price:"$$$",why:"Vongerichten's Jakarta-meets-Paris plates; lobster noodle and satay in a gorgeous room."},
  {name:"Markette",cuisine:"Modern European/Caribbean",neighborhood:"Chelsea",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$$",why:"Michelin Young Chef's oxtail shepherd's pie and salt-cod fritters, Euro-Caribbean flair."},
  {name:"Momoya Soho",cuisine:"Japanese",neighborhood:"Soho",borough:"Manhattan",rating:4.5,reviews:null,yelp:null,price:"$$$",why:"Two-level sushi bar with a large fish selection and an imaginative kaiseki menu."},
  {name:"Bar Primi Penn District",cuisine:"Italian",neighborhood:"Penn District",borough:"Manhattan",rating:null,reviews:null,yelp:4.0,price:"$$",why:"Carmellini's fresh made-to-order pasta; an easy pre-MSG or Penn Station bite."},
  {name:"Momofuku Noodle Bar",cuisine:"Asian noodles",neighborhood:"East Village",borough:"Manhattan",rating:4.5,reviews:5348,yelp:null,price:"$$",why:"David Chang's original; birthplace of the pork bun, a high-energy ramen counter."},
  {name:"Crown Shy",cuisine:"Modern American",neighborhood:"Financial District",borough:"Manhattan",rating:4.6,reviews:892,yelp:null,price:"$$$",why:"Michelin-starred Art Deco stunner; famous bread service and playful shareable plates."},
  {name:"Carne Mare",cuisine:"Italian Steakhouse/Seafood",neighborhood:"South Street Seaport",borough:"Manhattan",rating:4.5,reviews:777,yelp:null,price:"$$$$",why:"Carmellini's Italian chophouse; gorgonzola-cured Wagyu striploin with East River views."},
  {name:"Manhatta",cuisine:"Modern American",neighborhood:"Financial District",borough:"Manhattan",rating:4.7,reviews:3812,yelp:null,price:"$$$$",why:"Danny Meyer's 60th-floor room; panoramic skyline views and refined seasonal dinners."},
  {name:"Anassa Taverna",cuisine:"Greek",neighborhood:"Battery Park City",borough:"Manhattan",rating:4.4,reviews:293,yelp:null,price:"$$$",why:"Upscale seaside Greek taverna with fresh fish, octopus, and Plaka charm."},
  {name:"Atrio Wine Bar & Restaurant",cuisine:"Italian/Wine Bar",neighborhood:"Battery Park City",borough:"Manhattan",rating:3.9,reviews:125,yelp:null,price:"$$$",why:"Conrad hotel wine bar with pizzas, pasta, and Hudson River views."},
  {name:"Brooklyn Chop House",cuisine:"Steakhouse/Chinese fusion",neighborhood:"Financial District",borough:"Manhattan",rating:4.2,reviews:2033,yelp:null,price:"$$$$",why:"Buzzy FiDi steakhouse mashing dry-aged cuts with dim-sum dumplings."},
  {name:"Cafe Fleuri",cuisine:"French",neighborhood:"Financial District",borough:"Manhattan",rating:4.5,reviews:640,yelp:null,price:"$$$",why:"Sunny southern-French bistro with a garden hideaway out back."},
  {name:"Casa Oaxaca",cuisine:"Mexican",neighborhood:"Battery Park City",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$$",why:"Modern Oaxacan cooking, handmade masa and agave cocktails downtown."},
  {name:"Cut by Wolfgang Puck",cuisine:"Steakhouse",neighborhood:"Tribeca",borough:"Manhattan",rating:4.4,reviews:799,yelp:null,price:"$$$$",why:"Wolfgang Puck's power-lunch steakhouse inside the Four Seasons Downtown."},
  {name:"Del Frisco's Grille",cuisine:"Steakhouse",neighborhood:"Battery Park City",borough:"Manhattan",rating:4.3,reviews:705,yelp:null,price:"$$$",why:"Waterfront prime steaks and seafood with a polished modern-grille vibe."},
  {name:"Delmonico's",cuisine:"Steakhouse",neighborhood:"Financial District",borough:"Manhattan",rating:4.5,reviews:3347,yelp:null,price:"$$$$",why:"America's original 1837 steakhouse, birthplace of the Delmonico steak."},
  {name:"Felice 15 Gold Street",cuisine:"Italian",neighborhood:"Financial District",borough:"Manhattan",rating:4.5,reviews:973,yelp:null,price:"$$$",why:"Intimate Sant Ambroeus-family trattoria pouring authentic pastas and Tuscan wines."},
  {name:"Industry Kitchen",cuisine:"American",neighborhood:"South Street Seaport",borough:"Manhattan",rating:4.3,reviews:3636,yelp:null,price:"$$$",why:"Wood-oven pizza and grills with knockout Brooklyn Bridge waterfront views."},
  {name:"La Marchande",cuisine:"French",neighborhood:"Financial District",borough:"Manhattan",rating:4.2,reviews:null,yelp:null,price:"$$$$",why:"John Fraser's chic French chophouse inside the Wall Street Hotel."},
  {name:"Le District Bar & Bistro",cuisine:"French",neighborhood:"Battery Park City",borough:"Manhattan",rating:3.9,reviews:723,yelp:null,price:"$$$",why:"Waterfront French bistro at Brookfield Place with Hudson sunset views."},
  {name:"Le Gratin",cuisine:"French",neighborhood:"Financial District",borough:"Manhattan",rating:4.7,reviews:197,yelp:null,price:"$$$",why:"Daniel Boulud's cozy Lyonnais bistro serving soulful French classics downtown."},
  {name:"Maison Madison",cuisine:"French/Mediterranean",neighborhood:"Battery Park City",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$$",why:"Parisian-inspired cocktail lounge with elegant bites and refined riverside charm."},
  {name:"Maison Passerelle",cuisine:"French",neighborhood:"Financial District",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$$$",why:"Gregory Gourdet's opulent French-African-Asian fine dining inside Printemps New York."},
  {name:"Metropolis",cuisine:"American",neighborhood:"Financial District",borough:"Manhattan",rating:4.2,reviews:210,yelp:null,price:"$$$",why:"Marcus Samuelsson's theatrical New York bistro inside the Perelman arts center."},
  {name:"Mezze on the River",cuisine:"Mediterranean",neighborhood:"Battery Park City",borough:"Manhattan",rating:4.3,reviews:855,yelp:null,price:"$$$",why:"Waterfront Mediterranean seafood with a sweeping Hudson River sunset terrace."},
  {name:"Morton's the Steakhouse",cuisine:"Steakhouse",neighborhood:"Financial District",borough:"Manhattan",rating:4.5,reviews:960,yelp:4.0,price:"$$$$",why:"Classic upscale steakhouse plating prime-aged beef and old-school polish."},
  {name:"One Dine",cuisine:"American",neighborhood:"Financial District",borough:"Manhattan",rating:4.3,reviews:2042,yelp:null,price:"$$$$",why:"Contemporary American dining 100 stories above Manhattan at One World Observatory."},
  {name:"Recreation",cuisine:"American",neighborhood:"Financial District",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$",why:"Playful FiDi cocktail bar with arcade games, hoops, and shareable bites."},
  {name:"Saint Ambroeus Brookfield",cuisine:"Italian",neighborhood:"Battery Park City",borough:"Manhattan",rating:4.5,reviews:null,yelp:null,price:"$$$",why:"Milanese classics and elegant coffee-bar rituals at Brookfield Place."},
  {name:"Skinos",cuisine:"Greek",neighborhood:"Financial District",borough:"Manhattan",rating:4.6,reviews:null,yelp:null,price:"$$$",why:"Instagram-worthy modern Greek spot with floral decor and standout lamb chops."},
  {name:"Temple Court",cuisine:"American",neighborhood:"Financial District",borough:"Manhattan",rating:4.5,reviews:null,yelp:null,price:"$$$$",why:"Tom Colicchio's refined American dining under The Beekman's stunning atrium."},
  {name:"The Fulton",cuisine:"Seafood",neighborhood:"South Street Seaport",borough:"Manhattan",rating:4.3,reviews:803,yelp:null,price:"$$$",why:"Jean-Georges' pier seafood with knockout Brooklyn Bridge waterfront views."},
  {name:"David Burke Tavern",cuisine:"American",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.3,reviews:null,yelp:null,price:"$$$$",why:"Celebrity chef's playful, showstopping American plates in an elegant townhouse."},
  {name:"Zoì Mediterranean",cuisine:"Mediterranean",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.6,reviews:1720,yelp:null,price:"$$",why:"Bright mezze and Greek-Italian fusion in a stylish, buzzy neighborhood room."},
  {name:"Majorelle",cuisine:"Moroccan/French",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.6,reviews:null,yelp:null,price:"$$$$",why:"Stunning garden-lush Lowell Hotel room serving refined French-Mediterranean classics."},
  {name:"Cafe Boulud",cuisine:"French",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.5,reviews:null,yelp:null,price:"$$$$",why:"Daniel Boulud's Michelin-starred French cooking, polished and seasonal on the UES."},
  {name:"Dowling's at The Carlyle",cuisine:"American",neighborhood:"Upper East Side",borough:"Manhattan",rating:null,reviews:null,yelp:3.7,price:"$$$$",why:"Throwback New York classics in the storied, glamorous Carlyle Hotel dining room."},
  {name:"Tha Phraya",cuisine:"Thai",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.8,reviews:null,yelp:null,price:"$$",why:"Michelin Bib Gourmand Thai spanning bold regional dishes from across Thailand."},
  {name:"Felice 64",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.5,reviews:566,yelp:null,price:"$$$",why:"Cozy Tuscan wine bar, a longtime neighborhood favorite for Italian comfort."},
  {name:"A La Turka",cuisine:"Turkish",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.3,reviews:null,yelp:3.5,price:"$$",why:"Longtime UES Turkish spot for kebabs, mezze, and lively bottomless brunch."},
  {name:"Maya",cuisine:"Mexican",neighborhood:"Upper East Side",borough:"Manhattan",rating:null,reviews:null,yelp:null,price:"$$$",why:"Richard Sandoval's modern Mexican with 100-plus tequilas and award-winning margaritas."},
  {name:"Jacques Brasserie",cuisine:"French",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.4,reviews:null,yelp:null,price:"$$$",why:"Cozy rustic French brasserie doing escargot, steak frites, and profiteroles right."},
  {name:"BLT Prime",cuisine:"Steakhouse",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.5,reviews:null,yelp:null,price:"$$$$",why:"Prime steaks, famous popovers, and polished service on Lexington Avenue."},
  {name:"JoJo",cuisine:"French",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.2,reviews:719,yelp:null,price:"$$$$",why:"Jean-Georges' elegant townhouse debut, refined French cooking in an intimate UES setting."},
  {name:"Altesi Ristorante",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.2,reviews:276,yelp:null,price:"$$$",why:"Chic Tuscan dining with a see-and-be-seen crowd near Madison Avenue."},
  {name:"La Pecora Bianca",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.8,reviews:2783,yelp:null,price:"$$",why:"Sunny market-driven Italian with handmade pasta and a beloved neighborhood buzz."},
  {name:"Felice 83",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.3,reviews:665,yelp:3.6,price:"$$$",why:"Rustic Tuscan wine bar with cozy candlelit charm and hearty pastas."},
  {name:"Crave Fishbar",cuisine:"Seafood",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.8,reviews:86,yelp:null,price:"$$$",why:"Sustainable seafood and a lively oyster-happy-hour scene on Second Avenue."},
  {name:"Cafe D'Alsace",cuisine:"French/Alsatian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.7,reviews:null,yelp:null,price:"$$$",why:"Bustling Alsatian brasserie famed for its encyclopedic beer sommelier list."},
  {name:"Sistina",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.3,reviews:599,yelp:null,price:"$$$$",why:"Refined old-guard Italian fine dining with an epic wine cellar."},
  {name:"Caravaggio",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.5,reviews:377,yelp:null,price:"$$$$",why:"Polished modern Italian, art-lined walls and impeccable white-tablecloth service."},
  {name:"Uva Next Door",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.4,reviews:311,yelp:null,price:"$$$",why:"Cozy rustic wine bar pouring Italian bottles beside candlelit small plates."},
  {name:"Masseria East",cuisine:"Italian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.7,reviews:328,yelp:null,price:"$$$",why:"Puglian coastal cooking with handmade orecchiette in a warm rustic room."},
  {name:"Thep",cuisine:"Thai",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.7,reviews:7227,yelp:null,price:"$$",why:"Wildly popular modern Thai with bold flavors and buzzy weekend energy."},
  {name:"Mission Ceviche",cuisine:"Peruvian",neighborhood:"Upper East Side",borough:"Manhattan",rating:4.6,reviews:4470,yelp:4.3,price:"$$$",why:"Bright Peruvian ceviche and pisco cocktails from a beloved market alum."},
  {name:"French Louie",cuisine:"French-American bistro",neighborhood:"Boerum Hill",borough:"Brooklyn",rating:null,reviews:null,yelp:4.0,price:"$$$",why:"Charming Boerum Hill bistro nailing steak frites, oysters, and brunch."},
  {name:"Palo Santo",cuisine:"Latin American",neighborhood:"Park Slope",borough:"Brooklyn",rating:4.6,reviews:730,yelp:null,price:"$$$",why:"Market-driven pan-Latin cooking in a cozy Park Slope townhouse."},
  {name:"Meadowsweet",cuisine:"New American / Mediterranean",neighborhood:"Williamsburg",borough:"Brooklyn",rating:null,reviews:null,yelp:null,price:"$$$",why:"Michelin-recognized Williamsburg spot blending Americana with Mediterranean touches."},
  {name:"Francie",cuisine:"European / Contemporary",neighborhood:"Williamsburg",borough:"Brooklyn",rating:null,reviews:null,yelp:null,price:"$$$$",why:"Michelin-starred grandeur in a converted bank; handmade pastas and showstopper duck."},
  {name:"Dinner Party",cuisine:"New American",neighborhood:"Clinton Hill",borough:"Brooklyn",rating:null,reviews:null,yelp:null,price:"$$$",why:"Playful globally-inspired prix-fixe; oxtail ravioli and goat pepper stew shine."},
  {name:"Hupo",cuisine:"Szechuan Chinese",neighborhood:"Long Island City",borough:"Queens",rating:null,reviews:null,yelp:null,price:"$$",why:"Bib Gourmand Szechuan: tongue-numbing peppercorns, mapo tofu, dim sum galore."},
  {name:"Takumen",cuisine:"Japanese izakaya",neighborhood:"Long Island City",borough:"Queens",rating:4.3,reviews:1183,yelp:null,price:"$$",why:"Waterfront-adjacent izakaya slinging ramen, small plates, and lively cocktails."},
  {name:"Anassa Taverna Astoria",cuisine:"Greek",neighborhood:"Astoria",borough:"Queens",rating:4.7,reviews:null,yelp:null,price:"$$$",why:"Cozy Astoria taverna praised for grilled octopus, lamb chops, and seafood."},
  {name:"Fogo de Chão",cuisine:"Brazilian steakhouse",neighborhood:"Elmhurst",borough:"Queens",rating:null,reviews:null,yelp:null,price:"$$$",why:"All-you-can-eat churrasco carved tableside beside Queens Center."},
  {name:"Rivercrest",cuisine:"American / gastropub",neighborhood:"Astoria",borough:"Queens",rating:null,reviews:null,yelp:null,price:"$$",why:"Astoria's craft-beer sports bar with burgers, wings, and $30 deals."},
  {name:"Lorenzo's Bar & Cabaret",cuisine:"Italian-American",neighborhood:"Bloomfield",borough:"Staten Island",rating:null,reviews:null,yelp:null,price:"$$$",why:"Staten Island fine dining with live piano and Sunday jazz brunch."},
  {name:"J's On The Bay",cuisine:"New American",neighborhood:"Rosebank",borough:"Staten Island",rating:null,reviews:null,yelp:null,price:"$$",why:"Playful retro-diner-turned-family-favorite; crispy pizza, chicken and waffles."}
];

export function mapCuisine(cui){
  if (CMAP[cui]) return CMAP[cui];
  for (const k in CMAP){ if (cui && cui.toLowerCase().includes(k.toLowerCase())) return CMAP[k]; }
  return { c:"Worldwide", f:"🌍", r:"Europe" };
}

// Merge the seed with an optional restaurants.json (by name), enrich each row.
export async function loadData(){
  let rows = SEED.slice();
  try {
    const res = await fetch("restaurants.json", { cache:"no-store" });
    if (res.ok){
      const extra = await res.json();
      if (Array.isArray(extra)){
        const byName = new Map(rows.map(r => [r.name.toLowerCase(), r]));
        for (const r of extra){
          if (!r || !r.name) continue;
          const key = r.name.toLowerCase();
          if (byName.has(key)) Object.assign(byName.get(key), r);   // enrich seed
          else { rows.push(r); byName.set(key, r); }                // add new
        }
      }
    }
  } catch(e){ /* no restaurants.json — seed only, that's fine */ }

  for (const d of rows){
    const m = mapCuisine(d.cuisine);
    d.country = d.country || m.c;
    d.flag    = d.flag || m.f;
    d.region  = d.region || m.r;
    const cc = COUNTRY_COORDS[d.country] || COUNTRY_COORDS["Worldwide"];
    d.lat = cc[0]; d.lng = cc[1];
    if (d.rating === undefined) d.rating = null;
    if (d.reviews === undefined) d.reviews = null;
    if (d.yelp === undefined) d.yelp = null;
    if (!d.price) d.price = "$$$";
  }
  return rows;
}
