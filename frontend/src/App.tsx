import { useState, useRef, useMemo, useEffect } from "react";

// ─── CATEGORY & CONTACT CONFIG ───────────────────────────────────────────────
const CATS = [
  {id:"meat",     label:"Meat & Poultry", icon:"🥩", color:"#991B1B"},
  {id:"fish",     label:"Fish & Seafood", icon:"🐟", color:"#1E40AF"},
  {id:"dairy",    label:"Dairy",          icon:"🧀", color:"#166534"},
  {id:"produce",  label:"Produce",        icon:"🥦", color:"#92400E"},
  {id:"dry",      label:"Dry Goods",      icon:"🫙", color:"#6D28D9"},
  {id:"bakery",   label:"Bakery",         icon:"🍞", color:"#9A3412"},
  {id:"beverage", label:"Beverages",      icon:"🧃", color:"#0F766E"},
];

const CONTACT = [
  {id:"whatsapp", label:"WhatsApp", icon:"💬", bg:"#25D366", fg:"#fff"},
  {id:"sms",      label:"SMS",      icon:"📱", bg:"#2563EB", fg:"#fff"},
  {id:"email",    label:"Email",    icon:"📧", bg:"#7C3AED", fg:"#fff"},
];

// ─── SEED PRICE DATA (698 items from Sleepy Hollow Hotel invoices) ────────────
const SEED = {"yellow corn tortilla 4 inch":{"i":"Yellow Corn Tortilla 4 inch","p":87.6,"u":"case","v":"Bertram"},"almond milk 12/32 oz unswtnd":{"i":"ALMOND MILK 12/32 OZ UNSWTND","p":40.9,"u":"case","w":"32 OZ","k":"12/32 OZ","v":"Bertram","c":"dairy"},"apple pie filling":{"i":"APPLE PIE FILLING","p":66.3,"u":"case","v":"Bertram"},"argo corn starch 24/16 oz":{"i":"ARGO CORN STARCH 24/16 OZ","p":51.8,"u":"case","w":"16 OZ","k":"24/16 OZ","v":"Bertram"},"baby corn whole 6#10":{"i":"BABY CORN WHOLE 6#10","p":56.6,"u":"case","v":"Bertram"},"bagels kettle assorted mezonos":{"i":"BAGELS KETTLE ASSORTED MEZONOS","p":33.5,"u":"case","v":"Bertram","c":"bakery"},"bagels kettle plain 60/4.25 oz":{"i":"BAGELS KETTLE PLAIN 60/4.25 OZ","p":33.5,"u":"case","w":"4.25 OZ","k":"60/4.25 OZ","v":"Bertram","c":"bakery"},"baking powder 10lb":{"i":"BAKING POWDER 10LB","p":31.4,"u":"case","w":"10LB","v":"Bertram"},"baking soda 12/2lb":{"i":"BAKING SODA 12/2LB","p":36.05,"u":"case","w":"2LB","k":"12/2LB","v":"Bertram","c":"beverage"},"basmati rice 15lb":{"i":"BASMATI RICE 15LB","p":19.0,"u":"case","w":"15LB","v":"Bertram"},"bay leaves 8.5 oz":{"i":"BAY LEAVES 8.5 OZ","p":5.75,"u":"case","w":"8.5 OZ","v":"Bertram"},"beans lima large 24/1 lb":{"i":"BEANS LIMA LARGE 24/1 LB","p":59.5,"u":"case","w":"1 LB","k":"24/1 LB","v":"Bertram"},"beans navy 24/1 lb":{"i":"BEANS NAVY 24/1 LB","p":30.7,"u":"case","w":"1 LB","k":"24/1 LB","v":"Bertram"},"bittersweet coating 50 lb lb 1":{"i":"BITTERSWEET COATING 50 LB LB 1","p":186.15,"u":"case","w":"50 LB","v":"Bertram"},"black pepper butcher ground":{"i":"BLACK PEPPER BUTCHER GROUND","p":40.3,"u":"case","v":"Bertram"},"black pitted olives med 6#10":{"i":"BLACK PITTED OLIVES MED 6#10","p":57.25,"u":"case","v":"Bertram"},"blintz cheese cy 120/3 oz":{"i":"BLINTZ CHEESE CY 120/3 OZ","p":128.85,"u":"case","w":"3 OZ","k":"120/3 OZ","v":"Bertram","c":"dairy"},"blintz cheese cy 144 ct":{"i":"BLINTZ CHEESE CY 144 CT","p":67.1,"u":"case","v":"Bertram","c":"dairy"},"blood orange":{"i":"BLOOD ORANGE","p":40.5,"u":"case","v":"Bertram","c":"beverage"},"bread crumbs 25lb (usa)":{"i":"BREAD CRUMBS 25LB (USA)","p":31.1,"u":"case","w":"25LB","v":"Bertram","c":"bakery"},"bread crumbs panko 30 lb (usa)":{"i":"BREAD CRUMBS PANKO 30 LB (USA)","p":43.8,"u":"case","w":"30 LB","v":"Bertram","c":"bakery"},"bread pullman":{"i":"BREAD PULLMAN","p":31.05,"u":"case","v":"Bertram","c":"bakery"},"bread pullman whole":{"i":"BREAD PULLMAN WHOLE","p":30.7,"u":"case","v":"Bertram","c":"bakery"},"breadcrumbs 25 lb":{"i":"BREADCRUMBS 25 LB","p":31.1,"u":"case","w":"25 LB","v":"Bertram","c":"bakery"},"bulk chopped basil 12/1 lb":{"i":"BULK CHOPPED BASIL 12/1 LB","p":104.1,"u":"case","w":"1 LB","k":"12/1 LB","v":"Bertram"},"bulk cilantro chopped 12/1 lb":{"i":"BULK CILANTRO CHOPPED 12/1 LB","p":104.1,"u":"case","w":"1 LB","k":"12/1 LB","v":"Bertram"},"bulk parsley chopped 12/1 lb":{"i":"BULK PARSLEY CHOPPED 12/1 LB","p":104.1,"u":"case","w":"1 LB","k":"12/1 LB","v":"Bertram"},"bun hot dog soft 18/8 ct":{"i":"BUN HOT DOG SOFT 18/8 CT","p":52.95,"u":"case","v":"Bertram"},"caesar dressing 4/1 gallon":{"i":"CAESAR DRESSING 4/1 GALLON","p":48.95,"u":"case","v":"Bertram"},"california tomato paste 6#10":{"i":"CALIFORNIA TOMATO PASTE 6#10","p":70.45,"u":"case","v":"Bertram"},"caramel coffee syrup 6/750 ml":{"i":"CARAMEL COFFEE SYRUP 6/750 ML","p":55.5,"u":"case","v":"Bertram","c":"beverage"},"caramel cream filling parve lb 1":{"i":"CARAMEL CREAM FILLING PARVE LB 1","p":61.5,"u":"case","v":"Bertram","c":"dairy"},"cauliflower florets 16/24 oz":{"i":"CAULIFLOWER FLORETS 16/24 OZ","p":86.4,"u":"case","w":"24 OZ","k":"16/24 OZ","v":"Bertram"},"chamomile tea 12/20 ct":{"i":"CHAMOMILE TEA 12/20 CT","p":40.5,"u":"case","v":"Bertram","c":"beverage"},"cheese feta tub cy 18 lb":{"i":"CHEESE FETA TUB CY 18 LB","p":139.02,"u":"case","w":"18 LB","v":"Bertram","c":"dairy"},"cheese parmesan grated cy 5 lb":{"i":"CHEESE PARMESAN GRATED CY 5 LB","p":70.81,"u":"case","w":"5 LB","v":"Bertram","c":"dairy"},"chick peas (garbanzos) 6#10":{"i":"CHICK PEAS (GARBANZOS) 6#10","p":38.85,"u":"case","v":"Bertram"},"chickpeas (garbanzos) 24/1 lb":{"i":"CHICKPEAS (GARBANZOS) 24/1 LB","p":32.85,"u":"case","w":"1 LB","k":"24/1 LB","v":"Bertram"},"chocolate syrup 12/24 oz":{"i":"CHOCOLATE SYRUP 12/24 OZ","p":29.45,"u":"case","w":"24 OZ","k":"12/24 OZ","v":"Bertram"},"chulent mix 24/1 lb":{"i":"CHULENT MIX 24/1 LB","p":32.0,"u":"case","w":"1 LB","k":"24/1 LB","v":"Bertram"},"chunk light tuna in water":{"i":"CHUNK LIGHT TUNA IN WATER","p":70.9,"u":"case","v":"Bertram","c":"fish"},"coffee creamer 12/32 oz (usa)":{"i":"COFFEE CREAMER 12/32 OZ (USA)","p":31.85,"u":"case","w":"32 OZ","k":"12/32 OZ","v":"Bertram","c":"dairy"},"coffee creamer 12/32 oz":{"i":"COFFEE CREAMER 12/32 OZ","p":31.85,"u":"case","w":"32 OZ","k":"12/32 OZ","v":"Bertram","c":"dairy"},"cookie dough choc-chip":{"i":"COOKIE DOUGH CHOC-CHIP","p":70.1,"u":"case","v":"Bertram"},"cooking spray":{"i":"COOKING SPRAY","p":25.5,"u":"case","v":"Bertram"},"corn chips bbq pc 48/1 oz":{"i":"CORN CHIPS BBQ PC 48/1 OZ","p":24.1,"u":"case","w":"1 OZ","k":"48/1 OZ","v":"Bertram"},"corn chips w/g pc 48/1 oz":{"i":"CORN CHIPS W/G PC 48/1 OZ","p":22.05,"u":"case","w":"1 OZ","k":"48/1 OZ","v":"Bertram"},"corn flake crumbs 20 lb":{"i":"CORN FLAKE CRUMBS 20 LB","p":53.1,"u":"case","w":"20 LB","v":"Bertram"},"corn flakes 4/34 oz":{"i":"CORN FLAKES 4/34 OZ","p":23.7,"u":"case","w":"34 OZ","k":"4/34 OZ","v":"Bertram"},"corn pops 30/1 oz":{"i":"CORN POPS 30/1 OZ","p":15.35,"u":"case","w":"1 OZ","k":"30/1 OZ","v":"Bertram"},"cornflake crumbs yoshon 20 lb":{"i":"CORNFLAKE CRUMBS YOSHON 20 LB","p":53.1,"u":"case","w":"20 LB","v":"Bertram"},"cracker crisps creme & onion":{"i":"CRACKER CRISPS CREME & ONION","p":58.05,"u":"case","v":"Bertram"},"crackers round py 12/10.3 oz":{"i":"CRACKERS ROUND PY 12/10.3 OZ","p":51.5,"u":"case","w":"10.3 OZ","k":"12/10.3 OZ","v":"Bertram"},"craisin 25 lb":{"i":"CRAISIN 25 LB","p":91.62,"u":"case","w":"25 LB","v":"Bertram"},"cream cheese pc cy 100 ct":{"i":"CREAM CHEESE PC CY 100 CT","p":65.7,"u":"case","v":"Bertram","c":"dairy"},"crispy rice 4/32 oz":{"i":"CRISPY RICE 4/32 OZ","p":31.0,"u":"case","w":"32 OZ","k":"4/32 OZ","v":"Bertram"},"croutons garlic & onion":{"i":"CROUTONS GARLIC & ONION","p":39.8,"u":"case","v":"Bertram"},"diced tomato 6#10":{"i":"DICED TOMATO 6#10","p":32.7,"u":"case","v":"Bertram"},"diet coke 12/1.25 liter 1":{"i":"DIET COKE 12/1.25 LITER 1","p":28.85,"u":"case","k":"12/1.25 L","v":"Bertram"},"dutch cocoa pwd 50 lb 22/24%":{"i":"DUTCH COCOA PWD 50 LB 22/24%","p":452.67,"u":"case","w":"50 LB","v":"Bertram"},"egg barley (farfel) yoshon":{"i":"EGG BARLEY (FARFEL) YOSHON","p":47.45,"u":"case","v":"Bertram","c":"dairy"},"eggs grade a xl 30 dz":{"i":"EGGS GRADE A XL 30 DZ","p":48.5,"u":"case","v":"Bertram","c":"dairy"},"eggs liquid 15/2 lb":{"i":"EGGS LIQUID 15/2 LB","p":42.85,"u":"case","w":"2 LB","k":"15/2 LB","v":"Bertram","c":"dairy"},"eggs liquid bag in box 20 lb":{"i":"EGGS LIQUID BAG IN BOX 20 LB","p":30.91,"u":"case","w":"20 LB","v":"Bertram","c":"dairy"},"extra virgin olive oil 12/1 l":{"i":"EXTRA VIRGIN OLIVE OIL 12/1 L","p":143.45,"u":"case","w":"1 L","k":"12/1 L","v":"Bertram"},"extra virgin olive oil 15/1":{"i":"EXTRA VIRGIN OLIVE OIL 15/1","p":226.9,"u":"case","v":"Bertram"},"farina 12/28 oz":{"i":"FARINA 12/28 OZ","p":25.25,"u":"case","w":"28 OZ","k":"12/28 OZ","v":"Bertram"},"fettucine (yoshon)":{"i":"FETTUCINE (YOSHON)","p":25.8,"u":"case","v":"Bertram"},"fine black pepper 5 lb":{"i":"FINE BLACK PEPPER 5 LB","p":33.8,"u":"case","w":"5 LB","v":"Bertram"},"flour all-purpose yoshon":{"i":"FLOUR ALL-PURPOSE YOSHON","p":34.2,"u":"case","v":"Bertram"},"flour yoshon all purpose":{"i":"FLOUR YOSHON ALL PURPOSE","p":34.2,"u":"case","v":"Bertram"},"fries seasoned coated 6/4.5lb":{"i":"FRIES SEASONED COATED 6/4.5LB","p":45.75,"u":"case","w":"4.5LB","k":"6/4.5LB","v":"Bertram"},"fries shoestring cut 6/4.5 lb":{"i":"FRIES SHOESTRING CUT 6/4.5 LB","p":35.3,"u":"case","w":"4.5 LB","k":"6/4.5 LB","v":"Bertram"},"fries straight cut 3/8":{"i":"FRIES STRAIGHT CUT 3/8","p":36.5,"u":"case","v":"Bertram"},"frozen broccoli chopped":{"i":"FROZEN BROCCOLI CHOPPED","p":72.88,"u":"case","v":"Bertram"},"frozen broccoli florets":{"i":"FROZEN BROCCOLI FLORETS","p":86.4,"u":"case","v":"Bertram"},"frozen broccoli florets long":{"i":"FROZEN BROCCOLI FLORETS LONG","p":87.6,"u":"case","v":"Bertram"},"frozen cubes ginger chopped":{"i":"FROZEN CUBES GINGER CHOPPED","p":46.75,"u":"case","v":"Bertram"},"frozen parsley chopped 12/1 lb":{"i":"FROZEN PARSLEY CHOPPED 12/1 LB","p":104.1,"u":"case","w":"1 LB","k":"12/1 LB","v":"Bertram"},"frozen peas & carrots 12/16 oz":{"i":"FROZEN PEAS & CARROTS 12/16 OZ","p":23.4,"u":"case","w":"16 OZ","k":"12/16 OZ","v":"Bertram"},"frozen peas & carrots 20 lb":{"i":"FROZEN PEAS & CARROTS 20 LB","p":19.27,"u":"case","w":"20 LB","v":"Bertram"},"fruit whirls 12/15 oz":{"i":"FRUIT WHIRLS 12/15 OZ","p":67.7,"u":"case","w":"15 OZ","k":"12/15 OZ","v":"Bertram"},"garbanzo beans 6#10":{"i":"GARBANZO BEANS 6#10","p":33.15,"u":"case","v":"Bertram"},"green olives pitted 2/9 liter":{"i":"GREEN OLIVES PITTED 2/9 LITER","p":65.0,"u":"case","k":"2/9 L","v":"Bertram"},"green pitted olives 4/1 gallon":{"i":"GREEN PITTED OLIVES 4/1 GALLON","p":88.34,"u":"case","v":"Bertram"},"high gluten flour 10/5 lb":{"i":"HIGH GLUTEN FLOUR 10/5 LB","p":36.65,"u":"case","w":"5 LB","k":"10/5 LB","v":"Bertram"},"honey 6/5lb (usa)":{"i":"HONEY 6/5LB (USA)","p":74.3,"u":"case","w":"5LB","k":"6/5LB","v":"Bertram"},"hot green peppers 2/9 lt":{"i":"HOT GREEN PEPPERS 2/9 LT","p":34.7,"u":"case","k":"2/9 L","v":"Bertram"},"hot peppers 12/19oz 12/":{"i":"HOT PEPPERS 12/19OZ 12/","p":33.22,"u":"case","w":"19OZ","k":"12/19OZ","v":"Bertram"},"jelled cranberry sauce 24/14":{"i":"JELLED CRANBERRY SAUCE 24/14","p":76.25,"u":"case","k":"24/14 L","v":"Bertram"},"juice apple 6/64 oz":{"i":"JUICE APPLE 6/64 OZ","p":18.0,"u":"case","w":"64 OZ","k":"6/64 OZ","v":"Bertram","c":"beverage"},"juice apple box drink":{"i":"JUICE APPLE BOX DRINK","p":14.9,"u":"case","v":"Bertram","c":"beverage"},"juice cranberry 6/64 oz":{"i":"JUICE CRANBERRY 6/64 OZ","p":16.5,"u":"case","w":"64 OZ","k":"6/64 OZ","v":"Bertram","c":"beverage"},"juice grape 12/22 oz":{"i":"JUICE GRAPE 12/22 OZ","p":36.15,"u":"case","w":"22 OZ","k":"12/22 OZ","v":"Bertram","c":"beverage"},"juice orange 6/64 oz":{"i":"JUICE ORANGE 6/64 OZ","p":37.05,"u":"case","w":"64 OZ","k":"6/64 OZ","v":"Bertram","c":"beverage"},"juice pineapple 8/64 oz":{"i":"JUICE PINEAPPLE 8/64 OZ","p":58.8,"u":"case","w":"64 OZ","k":"8/64 OZ","v":"Bertram","c":"beverage"},"ketchup 6#10 (usa)":{"i":"KETCHUP 6#10 (USA)","p":42.65,"u":"case","v":"Bertram"},"knish potato puffs 120/4 oz":{"i":"KNISH POTATO PUFFS 120/4 OZ","p":60.7,"u":"case","w":"4 OZ","k":"120/4 OZ","v":"Bertram"},"kosher salt 9/3 lb":{"i":"KOSHER SALT 9/3 LB","p":72.05,"u":"case","w":"3 LB","k":"9/3 LB","v":"Bertram"},"lemon & honey green tea 12/20":{"i":"LEMON & HONEY GREEN TEA 12/20","p":39.8,"u":"case","v":"Bertram","c":"beverage"},"lemon juice 12/32 oz":{"i":"LEMON JUICE 12/32 OZ","p":17.85,"u":"case","w":"32 OZ","k":"12/32 OZ","v":"Bertram","c":"beverage"},"liquid creamy shortening 35 lb":{"i":"LIQUID CREAMY SHORTENING 35 LB","p":32.5,"u":"case","w":"35 LB","v":"Bertram","c":"dairy"},"mango smoothie bottles":{"i":"MANGO SMOOTHIE BOTTLES","p":86.2,"u":"case","v":"Bertram"},"mango syrup 6/48 oz":{"i":"MANGO SYRUP 6/48 OZ","p":63.55,"u":"case","w":"48 OZ","k":"6/48 OZ","v":"Bertram"},"margarine 0 trans unsalted":{"i":"MARGARINE 0 TRANS UNSALTED","p":44.0,"u":"case","v":"Bertram"},"margarine unsalted ztf 30/1 lb":{"i":"MARGARINE UNSALTED ZTF 30/1 LB","p":42.0,"u":"case","w":"1 LB","k":"30/1 LB","v":"Bertram"},"matzo ball mix 30-lb (usa)":{"i":"MATZO BALL MIX 30-LB (USA)","p":67.75,"u":"case","v":"Bertram"},"mayonnaise heavy 4/1 gallon":{"i":"MAYONNAISE HEAVY 4/1 GALLON","p":47.5,"u":"case","v":"Bertram"},"mayonnaise":{"i":"MAYONNAISE","p":41.0,"u":"case","v":"Bertram"},"medium bowties (yoshon) (can)":{"i":"MEDIUM BOWTIES (YOSHON) (CAN)","p":16.55,"u":"case","v":"Bertram"},"muffin batter corn 18 lb":{"i":"MUFFIN BATTER CORN 18 LB","p":45.95,"u":"case","w":"18 LB","v":"Bertram","c":"bakery"},"mushrooms pieces & stems 6#10":{"i":"MUSHROOMS PIECES & STEMS 6#10","p":55.0,"u":"case","v":"Bertram"},"mushrooms whole 6#10":{"i":"MUSHROOMS WHOLE 6#10","p":87.75,"u":"case","v":"Bertram"},"mustard (yellow) 4/1 gallon":{"i":"MUSTARD (YELLOW) 4/1 GALLON","p":23.15,"u":"case","v":"Bertram"},"natural rainbow":{"i":"NATURAL RAINBOW","p":91.3,"u":"case","v":"Bertram"},"noodles fine 1/16 inch yoshon":{"i":"NOODLES FINE 1/16 INCH YOSHON","p":26.1,"u":"case","v":"Bertram"},"noodles kugel 1/8 inch":{"i":"NOODLES KUGEL 1/8 INCH","p":36.95,"u":"case","v":"Bertram"},"noodles medium 1/4 in yoshon":{"i":"NOODLES MEDIUM 1/4 IN YOSHON","p":26.1,"u":"case","v":"Bertram"},"oat milk 12/33.8 oz":{"i":"OAT MILK 12/33.8 OZ","p":38.7,"u":"case","w":"33.8 OZ","k":"12/33.8 OZ","v":"Bertram","c":"dairy"},"oil canola 35 lb (usa)":{"i":"OIL CANOLA 35 LB (USA)","p":33.0,"u":"case","w":"35 LB","v":"Bertram"},"oil canola 35 lb":{"i":"OIL CANOLA 35 LB","p":32.0,"u":"case","w":"35 LB","v":"Bertram"},"onion granulated 6 lb":{"i":"ONION GRANULATED 6 LB","p":25.0,"u":"case","w":"6 LB","v":"Bertram"},"onion rings pc 48/0.5 oz":{"i":"ONION RINGS PC 48/0.5 OZ","p":24.1,"u":"case","w":"0.5 OZ","k":"48/0.5 OZ","v":"Bertram"},"original soy milk 12/1 qt":{"i":"ORIGINAL SOY MILK 12/1 QT","p":38.7,"u":"case","v":"Bertram","c":"dairy"},"pancake mix egg yoshon 6/5 lb":{"i":"PANCAKE MIX EGG YOSHON 6/5 LB","p":42.8,"u":"case","w":"5 LB","k":"6/5 LB","v":"Bertram","c":"dairy"},"par boiled rice 25lb (usa)":{"i":"PAR BOILED RICE 25LB (USA)","p":21.0,"u":"case","w":"25LB","v":"Bertram"},"parsley flake 1.5 lb":{"i":"PARSLEY FLAKE 1.5 LB","p":6.75,"u":"case","w":"1.5 LB","v":"Bertram"},"passion fruit smoothie":{"i":"PASSION FRUIT SMOOTHIE","p":86.2,"u":"case","v":"Bertram"},"pasta fettuccine yoshon 20 lb":{"i":"PASTA FETTUCCINE YOSHON 20 LB","p":25.65,"u":"case","w":"20 LB","v":"Bertram"},"pasta penne yoshon 20 lb":{"i":"PASTA PENNE YOSHON 20 LB","p":25.95,"u":"case","w":"20 LB","v":"Bertram"},"pastry squares 5x5 (usa) 120":{"i":"PASTRY SQUARES 5x5 (USA) 120","p":48.95,"u":"case","v":"Bertram"},"pc jam strawberry 120/0.5 oz":{"i":"PC JAM STRAWBERRY 120/0.5 OZ","p":12.65,"u":"case","w":"0.5 OZ","k":"120/0.5 OZ","v":"Bertram"},"pc ketchup 300 ct":{"i":"PC KETCHUP 300 CT","p":15.7,"u":"case","v":"Bertram"},"pc mayonnaise 300 ct":{"i":"PC MAYONNAISE 300 CT","p":22.05,"u":"case","v":"Bertram"},"pc sugar o-k 2000 ct":{"i":"PC SUGAR O-K 2000 CT","p":19.9,"u":"case","v":"Bertram"},"pc sweetner 1000 ct":{"i":"PC SWEETNER 1000 CT","p":14.6,"u":"case","v":"Bertram"},"pc sweetner 2000 ct":{"i":"PC SWEETNER 2000 CT","p":45.2,"u":"case","v":"Bertram"},"pc table syrup 60/1 oz":{"i":"PC TABLE SYRUP 60/1 OZ","p":15.9,"u":"case","w":"1 OZ","k":"60/1 OZ","v":"Bertram"},"pearl barley medium yoshon":{"i":"PEARL BARLEY MEDIUM YOSHON","p":21.85,"u":"case","v":"Bertram"},"penne rigate 20 lb yoshon(usa)":{"i":"PENNE RIGATE 20 LB YOSHON(USA)","p":25.95,"u":"case","w":"20 LB","v":"Bertram"},"pickles sour 30 lb":{"i":"PICKLES SOUR 30 LB","p":33.6,"u":"case","w":"30 LB","v":"Bertram"},"pina colada smoothie":{"i":"PINA COLADA SMOOTHIE","p":86.2,"u":"case","v":"Bertram"},"pina colada syrup 6/48 oz":{"i":"PINA COLADA SYRUP 6/48 OZ","p":63.55,"u":"case","w":"48 OZ","k":"6/48 OZ","v":"Bertram"},"pitted black olives 2/9 liter":{"i":"PITTED BLACK OLIVES 2/9 LITER","p":80.7,"u":"case","k":"2/9 L","v":"Bertram"},"pitted green olives 2/9 liter":{"i":"PITTED GREEN OLIVES 2/9 LITER","p":65.0,"u":"case","k":"2/9 L","v":"Bertram"},"popcorn kernels 24/1 lb":{"i":"POPCORN KERNELS 24/1 LB","p":23.1,"u":"case","w":"1 LB","k":"24/1 LB","v":"Bertram"},"popcorn pc 50/1 oz":{"i":"POPCORN PC 50/1 OZ","p":25.55,"u":"case","w":"1 OZ","k":"50/1 OZ","v":"Bertram"},"potato chips bbq pc 96/0.75 oz":{"i":"POTATO CHIPS BBQ PC 96/0.75 OZ","p":41.45,"u":"case","w":"0.75 OZ","k":"96/0.75 OZ","v":"Bertram"},"potato chips pc 96/0.75 oz":{"i":"POTATO CHIPS PC 96/0.75 OZ","p":41.45,"u":"case","w":"0.75 OZ","k":"96/0.75 OZ","v":"Bertram"},"potato sticks 12/6 oz":{"i":"POTATO STICKS 12/6 OZ","p":35.5,"u":"case","w":"6 OZ","k":"12/6 OZ","v":"Bertram"},"potato whitener (stay -white) e&s lb 1":{"i":"POTATO WHITENER (STAY -WHITE) E&S LB 1","p":47.85,"u":"case","v":"Bertram"},"pretzel crumbs 10 lbs yoshon":{"i":"PRETZEL CRUMBS 10 LBS YOSHON","p":32.5,"u":"case","v":"Bertram"},"pretzel rods 18/12 oz":{"i":"PRETZEL RODS 18/12 OZ","p":41.15,"u":"case","w":"12 OZ","k":"18/12 OZ","v":"Bertram"},"pretzels pc enriched yoshon":{"i":"PRETZELS PC ENRICHED YOSHON","p":16.65,"u":"case","v":"Bertram"},"puffed pastry sheet 10 x15":{"i":"PUFFED PASTRY SHEET 10 X15","p":48.95,"u":"case","v":"Bertram"},"pure chocolate drops 4m 33 lb":{"i":"PURE CHOCOLATE DROPS 4M 33 LB","p":258.85,"u":"case","w":"33 LB","v":"Bertram"},"ramen noodles chicken flavor":{"i":"RAMEN NOODLES CHICKEN FLAVOR","p":18.25,"u":"case","v":"Bertram","c":"meat"},"raspberry tea 12/20 ct":{"i":"RASPBERRY TEA 12/20 CT","p":40.5,"u":"case","v":"Bertram","c":"beverage"},"red cooking wine 12/12.7oz":{"i":"RED COOKING WINE 12/12.7OZ","p":24.5,"u":"case","w":"12.7OZ","k":"12/12.7OZ","v":"Bertram","c":"beverage"},"rice basmati 15 lb":{"i":"RICE BASMATI 15 LB","p":19.0,"u":"case","w":"15 LB","v":"Bertram"},"rotelli (yoshon)(can)":{"i":"ROTELLI (YOSHON)(CAN)","p":26.65,"u":"case","v":"Bertram"},"seltzer 12/1 liter":{"i":"SELTZER 12/1 LITER","p":9.9,"u":"case","k":"12/1 L","v":"Bertram"},"smoked paprika 5lb e&s lb 1":{"i":"SMOKED PAPRIKA 5LB E&S LB 1","p":38.35,"u":"case","w":"5LB","v":"Bertram"},"soup base chicken 40 lb (usa)":{"i":"SOUP BASE CHICKEN 40 LB (USA)","p":53.2,"u":"case","w":"40 LB","v":"Bertram","c":"meat"},"soup base onion no msg 25lb gf e&s lb 1":{"i":"SOUP BASE ONION NO MSG 25LB GF E&S LB 1","p":79.1,"u":"case","w":"25LB","v":"Bertram"},"soup mandlen mini canister":{"i":"SOUP MANDLEN MINI CANISTER","p":47.85,"u":"case","v":"Bertram"},"soy milk original 12/1 qt":{"i":"SOY MILK ORIGINAL 12/1 QT","p":38.7,"u":"case","v":"Bertram","c":"dairy"},"soy sauce 4/1 gallon (usa)":{"i":"SOY SAUCE 4/1 GALLON (USA)","p":32.5,"u":"case","v":"Bertram"},"spanish paprika 5 lb":{"i":"SPANISH PAPRIKA 5 LB","p":19.6,"u":"case","w":"5 LB","v":"Bertram"},"strawberry burst tea 12/20 ct":{"i":"STRAWBERRY BURST TEA 12/20 CT","p":40.5,"u":"case","v":"Bertram","c":"beverage"},"strawberry daiquiri syrup":{"i":"STRAWBERRY DAIQUIRI SYRUP","p":63.55,"u":"case","v":"Bertram"},"strawberry jam 120/.5 oz":{"i":"STRAWBERRY JAM 120/.5 OZ","p":14.25,"u":"case","w":"5 OZ","v":"Bertram"},"strawberry smoothie":{"i":"STRAWBERRY SMOOTHIE","p":86.2,"u":"case","v":"Bertram"},"sugar 10/4 lb":{"i":"SUGAR 10/4 LB","p":44.55,"u":"case","w":"4 LB","k":"10/4 LB","v":"Bertram"},"sweet & sour sauce 4/1 gallon":{"i":"SWEET & SOUR SAUCE 4/1 GALLON","p":50.6,"u":"case","v":"Bertram"},"sweet chili sauce 4/1 gallon":{"i":"SWEET CHILI SAUCE 4/1 GALLON","p":76.3,"u":"case","v":"Bertram"},"sweet n sour duck sauce":{"i":"SWEET N SOUR DUCK SAUCE","p":50.75,"u":"case","v":"Bertram"},"table salt 24/26 oz":{"i":"TABLE SALT 24/26 OZ","p":23.0,"u":"case","w":"26 OZ","k":"24/26 OZ","v":"Bertram"},"taco shells 6/12 ct":{"i":"TACO SHELLS 6/12 CT","p":21.4,"u":"case","v":"Bertram"},"taco shells mini 12/8 ct":{"i":"TACO SHELLS MINI 12/8 CT","p":77.5,"u":"case","v":"Bertram"},"taster choice (red) coffee":{"i":"TASTER CHOICE (red) COFFEE","p":58.05,"u":"case","v":"Bertram","c":"beverage"},"tasters choice decf instnt":{"i":"TASTERS CHOICE DECF INSTNT","p":62.75,"u":"case","v":"Bertram"},"tasters choice instant coffee":{"i":"TASTERS CHOICE INSTANT COFFEE","p":262.8,"u":"case","v":"Bertram","c":"beverage"},"tater tots 340 ct 10 lb":{"i":"TATER TOTS 340 CT 10 LB","p":29.42,"u":"case","w":"10 LB","v":"Bertram"},"tempura mix 50 lb e&s lb 1":{"i":"TEMPURA MIX 50 LB E&S LB 1","p":80.7,"u":"case","w":"50 LB","v":"Bertram"},"teriyaki sauce 4/1 gallon":{"i":"TERIYAKI SAUCE 4/1 GALLON","p":37.6,"u":"case","v":"Bertram"},"thousand island dressing 4/1":{"i":"THOUSAND ISLAND DRESSING 4/1","p":46.55,"u":"case","v":"Bertram"},"tofu extra firm 6/16 oz":{"i":"TOFU EXTRA FIRM 6/16 OZ","p":12.45,"u":"case","w":"16 OZ","k":"6/16 OZ","v":"Bertram"},"tortilla chips w/g":{"i":"TORTILLA CHIPS W/G","p":23.3,"u":"case","v":"Bertram"},"tuna chunk light 6/66.5 oz":{"i":"TUNA CHUNK LIGHT 6/66.5 OZ","p":72.85,"u":"case","w":"66.5 OZ","k":"6/66.5 OZ","v":"Bertram","c":"fish"},"tuna light chunk 6/66.5 oz":{"i":"TUNA LIGHT CHUNK 6/66.5 OZ","p":59.95,"u":"case","w":"66.5 OZ","k":"6/66.5 OZ","v":"Bertram","c":"fish"},"vanilla sugar 10 lb":{"i":"VANILLA SUGAR 10 LB","p":22.6,"u":"case","w":"10 LB","v":"Bertram"},"water 12/1.5 liter":{"i":"WATER 12/1.5 LITER","p":12.0,"u":"case","k":"12/1.5 L","v":"Bertram","c":"beverage"},"water 15/1 liter":{"i":"WATER 15/1 LITER","p":10.9,"u":"case","k":"15/1 L","v":"Bertram","c":"beverage"},"water 24/16.9 oz":{"i":"WATER 24/16.9 OZ","p":6.7,"u":"case","w":"16.9 OZ","k":"24/16.9 OZ","v":"Bertram","c":"beverage"},"water 32/16.9 oz":{"i":"WATER 32/16.9 OZ","p":10.75,"u":"case","w":"16.9 OZ","k":"32/16.9 OZ","v":"Bertram","c":"beverage"},"whip topping 24/16 oz":{"i":"WHIP TOPPING 24/16 OZ","p":61.65,"u":"case","w":"16 OZ","k":"24/16 OZ","v":"Bertram"},"white vinegar 4/1 gallon":{"i":"WHITE VINEGAR 4/1 GALLON","p":11.5,"u":"case","v":"Bertram"},"whole cloves 4":{"i":"WHOLE CLOVES 4","p":50.81,"u":"case","w":"4 LB","v":"Bertram"},"whole hearts of palm 12/28 oz":{"i":"WHOLE HEARTS OF PALM 12/28 OZ","p":55.75,"u":"case","w":"28 OZ","k":"12/28 OZ","v":"Bertram"},"wildberry&passionfruit green":{"i":"WILDBERRY&PASSIONFRUIT GREEN","p":40.5,"u":"case","v":"Bertram"},"wrappers spring roll 40/25 ct":{"i":"WRAPPERS SPRING ROLL 40/25 CT","p":51.25,"u":"case","v":"Bertram","c":"bakery"},"ziti 20lb yoshon(usa)":{"i":"ZITI 20LB YOSHON(USA)","p":25.95,"u":"case","w":"20LB","v":"Bertram"},"liquid eggs 15x2lb":{"i":"Liquid Eggs 15x2lb","p":42.85,"w":"2 LB","v":"Newburg Foods","c":"dairy"},"margarine unsalted zero trans fat":{"i":"Margarine Unsalted Zero Trans Fat","p":42.0,"w":"1 LB","v":"Newburg Foods","c":"dairy"},"titos 750 ml":{"i":"Titos 750 ML","p":18.89,"w":"750 ML","v":"Wine on 59","c":"beverage"},"purity vodka 750 ml":{"i":"Purity Vodka 750 ML","p":23.39,"w":"750 ML","v":"Wine on 59","c":"beverage"},"zarza anejo 750 ml":{"i":"Zarza Anejo 750 ML","p":51.29,"w":"750 ML","v":"Wine on 59"},"mexxo reposado 1 l":{"i":"Mexxo Reposado 1 L","p":17.99,"w":"1 L","v":"Wine on 59"},"la puerta negra blanco 1 l":{"i":"La Puerta Negra Blanco 1 L","p":15.29,"w":"1 L","v":"Wine on 59"},"don ramon reposado 750 ml":{"i":"Don Ramon Reposado 750 ML","p":26.09,"w":"750 ML","v":"Wine on 59"},"baha rum 1 l":{"i":"Baha Rum 1 L","p":8.09,"w":"1 L","v":"Wine on 59","c":"beverage"},"gordons gin 750 ml":{"i":"Gordons Gin 750 ML","p":14.39,"w":"750 ML","v":"Wine on 59","c":"beverage"},"voda vodka 1 l":{"i":"Voda Vodka 1 L","p":8.99,"w":"1 L","v":"Wine on 59","c":"beverage"},"jack daniels whiskey black":{"i":"Jack Daniels Whiskey Black","p":28.79,"v":"Wine on 59","c":"beverage"},"wild turkey 101 proof 750ml":{"i":"Wild Turkey 101 Proof 750ml","p":26.09,"w":"750 ML","v":"Wine on 59","c":"meat"},"makers mark 750ml":{"i":"Makers Mark 750ml","p":34.19,"w":"750 ML","v":"Wine on 59"},"tomintoul tlath 750 ml":{"i":"Tomintoul Tlath 750 ML","p":28.79,"w":"750 ML","v":"Wine on 59"},"barkan cl cab sauv 750ml":{"i":"Barkan Cl Cab Sauv 750ml","p":8.79,"w":"750 ML","v":"Wine on 59","c":"beverage"},"baron herzog cab suav":{"i":"Baron Herzog Cab Suav","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"les riganes rose 750 ml":{"i":"Les Riganes Rose 750 ML","p":9.59,"w":"750 ML","v":"Wine on 59"},"baron herzog chardonnay":{"i":"Baron Herzog Chardonnay","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"& sour 1 l":{"i":"& SOUR 1 L","p":6.02,"w":"1 L","v":"Wine on 59"},"finest grenadine syrup 1l":{"i":"Finest Grenadine Syrup 1L","p":5.93,"w":"1 L","v":"Wine on 59"},"challah xl pan":{"i":"Challah XL Pan","p":14.0,"w":"3.5 LB","v":"Sanders Bakery Monsey","c":"bakery"},"round large bundt cake":{"i":"Round Large Bundt Cake","p":14.0,"v":"Sanders Bakery Monsey"},"double berry":{"i":"Double Berry","p":2.5,"v":"Ice Cream Factory"},"sherbet gelato pan 5l":{"i":"Sherbet Gelato Pan 5L","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"ice cream gelato pan 5 l":{"i":"Ice Cream Gelato Pan 5 L","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"ice cream gelato pan 5 l / vanilla":{"i":"Ice Cream Gelato Pan 5 L / vanilla","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"matjes herring 5lb":{"i":"Matjes Herring 5lb","p":42.5,"w":"5 LB","v":"Sushi Maven","c":"fish"},"matjes jalapeno herring 5lb":{"i":"Matjes Jalapeno Herring 5lb","p":53.5,"w":"5 LB","v":"Sushi Maven","c":"fish"},"tidbit herring 5lb":{"i":"Tidbit Herring 5lb","p":37.5,"w":"5 LB","v":"Sushi Maven","c":"fish"},"spicy lekovod shabbos herring 5lb":{"i":"Spicy Lekovod Shabbos Herring 5lb","p":42.5,"w":"5 LB","v":"Sushi Maven","c":"fish"},"postiv 7/24 romaine 10.5 lb":{"i":"Postiv 7/24 Romaine 10.5 LB","p":69.0,"w":"10.5 LB","v":"Golden Taste"},"fish 5 lb":{"i":"FISH 5 LB","p":35.0,"w":"5 LB","v":"Golden Taste","c":"fish"},"nova lox 5 lb":{"i":"NOVA LOX 5 LB","p":35.0,"w":"5 LB","v":"Golden Taste","c":"produce"},"sour bkt 30 lb":{"i":"SOUR BKT 30 LB","p":27.5,"w":"30 LB","v":"Golden Taste"},"kt green cabbage/carrot 4/":{"i":"KT Green Cabbage/Carrot 4/","p":30.0,"v":"Golden Taste","c":"produce"},"kt red cabbage 4/":{"i":"KT Red Cabbage 4/","p":36.0,"v":"Golden Taste","c":"produce"},"kt spring mix bulk 1 lb":{"i":"KT Spring Mix Bulk 1 LB","p":12.0,"w":"1 LB","v":"Golden Taste"},"kt sweet crispy leaf bulk 1 lb":{"i":"KT Sweet Crispy Leaf Bulk 1 LB","p":12.0,"w":"1 LB","v":"Golden Taste"},"chives":{"i":"chives","p":25.0,"v":"AJE Produce"},"stoli gluten free oup 1 l":{"i":"Stoli Gluten Free OUP 1 L","p":26.99,"w":"1 L","v":"Wine on 59"},"casamigos reposado 750 ml":{"i":"Casamigos Reposado 750 ML","p":50.39,"w":"750 ML","v":"Wine on 59"},"don ramon blanco 750 ml":{"i":"Don Ramon Blanco 750 ML","p":23.39,"w":"750 ML","v":"Wine on 59"},"rambam prosecco 750ml":{"i":"Rambam Prosecco 750ml","p":12.79,"w":"750 ML","v":"Wine on 59"},"bartenura prosecco brut 750ml":{"i":"Bartenura Prosecco Brut 750ml","p":13.59,"w":"750 ML","v":"Wine on 59"},"baron herzog merlot 750ml":{"i":"Baron Herzog Merlot 750ml","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"barkan cl chardonnay 750ml":{"i":"Barkan Cl Chardonnay 750ml","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"patsch reposado 750 ml":{"i":"Patsch Reposado 750 ML","p":42.29,"w":"750 ML","v":"Wine on 59"},"zion imperial rose 750 ml":{"i":"Zion Imperial Rose 750 ML","p":10.39,"w":"750 ML","v":"Wine on 59"},"dekuyper triple sec 1l":{"i":"Dekuyper Triple Sec 1L","p":11.69,"w":"1 L","v":"Wine on 59"},"herzog pinot grigio 750ml":{"i":"Herzog Pinot Grigio 750ml","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"herzog sauvignon blanc 750 ml":{"i":"Herzog Sauvignon Blanc 750 ml","p":9.59,"w":"750 ML","v":"Wine on 59","c":"beverage"},"ca 24/1 lb":{"i":"CA 24/1 LB","p":23.1,"w":"1 LB","v":"Newburg Foods"},"ca & bgan lb":{"i":"CA & BGAN LB","p":39.8,"v":"Newburg Foods","c":"produce"},"ca 4/1 gal":{"i":"CA 4/1 GAL","p":88.34,"v":"Newburg Foods"},"ca tots 340 ct 10 lb":{"i":"CA TOTS 340 CT 10 LB","p":29.42,"w":"10 LB","v":"Newburg Foods"},"ca 60/4.25 oz bgan":{"i":"CA 60/4.25 OZ BGAN","p":33.5,"w":"4.25 OZ","v":"Newburg Foods","c":"bakery"},"ca bgan oz":{"i":"CA BGAN OZ","p":33.5,"v":"Newburg Foods","c":"bakery"},"ca cut 3/8 bgan lb":{"i":"CA CUT 3/8 BGAN LB","p":36.5,"v":"Newburg Foods"},"club bread":{"i":"Club Bread","p":3.5,"v":"Sanders Bakery Monsey","c":"bakery"},"focaccia round":{"i":"Focaccia Round","p":1.25,"v":"Sanders Bakery Monsey","c":"produce"},"mini donuts":{"i":"Mini Donuts","p":1.25,"v":"Sanders Bakery Monsey"},"rect. bilka":{"i":"Rect. Bilka","p":1.15,"v":"Sanders Bakery Monsey","c":"bakery"},"square bilka":{"i":"Square Bilka","p":1.15,"v":"Sanders Bakery Monsey","c":"bakery"},"rolls":{"i":"Rolls","p":0.7,"v":"Sanders Bakery Monsey","c":"bakery"},"lg bread assorted":{"i":"Lg bread Assorted","p":12.0,"v":"Sanders Bakery Monsey","c":"bakery"},"rugelech lb.":{"i":"Rugelech Lb.","p":8.5,"v":"Sanders Bakery Monsey"},"cookies lb.":{"i":"Cookies Lb.","p":8.5,"v":"Sanders Bakery Monsey"},"nap napoleon sheet":{"i":"Nap Napoleon Sheet","p":75.0,"v":"Sanders Bakery Monsey","c":"bakery"},"eclairs/cream p... eclairs lb":{"i":"eclairs/Cream P... eclairs LB","p":8.5,"v":"Sanders Bakery Monsey","c":"dairy"},"kokosh flat":{"i":"Kokosh Flat","p":16.0,"v":"Sanders Bakery Monsey"},"roung babka lg round":{"i":"Roung Babka lg Round","p":15.0,"v":"Sanders Bakery Monsey"},"egg kichel lb.":{"i":"Egg Kichel Lb.","p":8.5,"v":"Sanders Bakery Monsey","c":"dairy"},"egg kichel oni... lb onion":{"i":"Egg Kichel Oni... Lb Onion","p":9.0,"w":"... LB","v":"Sanders Bakery Monsey","c":"dairy"},"butter cookieslb lb. cookies":{"i":"butter cookieslb Lb. cookies","p":9.5,"v":"Sanders Bakery Monsey","c":"dairy"},"cheese delkale... lb. delkalech":{"i":"Cheese Delkale... Lb. Delkalech","p":9.5,"w":"... LB","v":"Sanders Bakery Monsey","c":"dairy"},"mini carrot m... muffin":{"i":"Mini Carrot M... Muffin","p":0.85,"v":"Sanders Bakery Monsey","c":"produce"},"cheese bars mini":{"i":"cheese bars Mini","p":1.4,"v":"Sanders Bakery Monsey","c":"dairy"},"cheese florets mini":{"i":"Cheese Florets Mini","p":0.95,"v":"Sanders Bakery Monsey","c":"dairy"},"\" cheese cake... 9\" cake round":{"i":"\" Cheese Cake... 9\" Cake round","p":38.0,"v":"Sanders Bakery Monsey","c":"dairy"},"large sourdough":{"i":"Large Sourdough","p":12.0,"v":"Sanders Bakery Monsey"},"bagels":{"i":"Bagels","p":0.8,"v":"Sanders Bakery Monsey","c":"bakery"},"focaccia tomat... tomatoe sq":{"i":"Focaccia Tomat... Tomatoe Sq","p":0.8,"v":"Sanders Bakery Monsey","c":"produce"},"olive sq square":{"i":"Olive Sq Square","p":1.0,"v":"Sanders Bakery Monsey"},"mini babke on ... stick":{"i":"Mini Babke on ... Stick","p":1.5,"v":"Sanders Bakery Monsey","c":"bakery"},"cheese cannoli":{"i":"cheese cannoli","p":1.75,"v":"Sanders Bakery Monsey","c":"dairy"},"mini cheese cu... cups":{"i":"Mini Cheese cu... cups","p":1.95,"v":"Sanders Bakery Monsey","c":"dairy"},"(cid:36)":{"i":"(cid:36)","p":3744.7,"v":"Sanders Bakery Monsey"},"babke dough lb":{"i":"Babke Dough Lb","p":5.0,"v":"Sanders Bakery Monsey"},"club sl bread slices":{"i":"Club SL Bread Slices","p":3.5,"v":"Sanders Bakery Monsey","c":"bakery"},"apple cobbler ... alum":{"i":"Apple Cobbler ... Alum","p":40.0,"v":"Sanders Bakery Monsey"},"rainbow sheet":{"i":"Rainbow Sheet","p":120.0,"v":"Sanders Bakery Monsey"},"brownie sheet ... flat":{"i":"Brownie Sheet ... Flat","p":10.0,"v":"Sanders Bakery Monsey"},"brownie roaster":{"i":"Brownie Roaster","p":40.0,"v":"Sanders Bakery Monsey"},".5 nap napoleon sheet":{"i":".5 Nap Napoleon Sheet","p":75.0,"v":"Sanders Bakery Monsey","c":"bakery"},"mini cheese mu... muffin":{"i":"Mini cheese mu... muffin","p":0.85,"v":"Sanders Bakery Monsey","c":"dairy"},"pizzas dough ... lb":{"i":"Pizzas Dough ... LB","p":2.5,"v":"Sanders Bakery Monsey"},".5 rainbow sheet":{"i":".5 Rainbow Sheet","p":120.0,"v":"Sanders Bakery Monsey"},"standing mini log / ice cream":{"i":"Standing Mini Log / ice cream","p":2.75,"v":"Ice Cream Factory","c":"dairy"},"sherbet gelato pan 5l / strawberry":{"i":"Sherbet Gelato Pan 5L / strawberry","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"sherbet gelato pan 5l / mango":{"i":"Sherbet Gelato Pan 5L / mango","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"sherbet gelato pan 5l / lemon":{"i":"Sherbet Gelato Pan 5L / lemon","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"sherbet gelato pan 5l / raspberry":{"i":"Sherbet Gelato Pan 5L / raspberry","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"ice cream gelato pan 5 l / peanut butter":{"i":"Ice Cream Gelato Pan 5 L / peanut butter","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"ice cream gelato pan 5 l / chocolate fudge":{"i":"Ice Cream Gelato Pan 5 L / chocolate fudge","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"ice cream gelato pan 5 l / salted caramel":{"i":"Ice Cream Gelato Pan 5 L / salted caramel","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / black cookie crumbs":{"i":"Ice Cream Topping 2 LB / black cookie crumbs","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / white cookie crumbs":{"i":"Ice Cream Topping 2 LB / white cookie crumbs","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / nut crunch":{"i":"Ice Cream Topping 2 LB / nut crunch","p":18.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"sherbet pop classic / strawberry":{"i":"Sherbet Pop Classic / strawberry","p":1.5,"v":"Ice Cream Factory","c":"produce"},"sherbet pop classic / mango":{"i":"Sherbet Pop Classic / mango","p":1.5,"v":"Ice Cream Factory","c":"produce"},"sherbet pop classic / passion":{"i":"Sherbet Pop Classic / passion","p":1.5,"v":"Ice Cream Factory","c":"produce"},"sherbet pop classic / raspberry":{"i":"Sherbet Pop Classic / raspberry","p":1.5,"v":"Ice Cream Factory","c":"produce"},"sherbet pop classic / lemon":{"i":"Sherbet Pop Classic / lemon","p":1.5,"v":"Ice Cream Factory","c":"produce"},"-p ice cream log cake / vanilla":{"i":"-P Ice Cream Log Cake / vanilla","p":38.0,"v":"Ice Cream Factory","c":"dairy"},"-p ice cream log cake / chocolate":{"i":"-P Ice Cream Log Cake / chocolate","p":38.0,"v":"Ice Cream Factory","c":"dairy"},"sherbet log cake long / strawberry":{"i":"Sherbet Log Cake Long / strawberry","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log cake long / mango":{"i":"Sherbet Log Cake Long / mango","p":38.0,"v":"Ice Cream Factory","c":"produce"},"standing mini log / ice cream no":{"i":"Standing Mini Log / ice cream NO","p":2.75,"v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / chocolate cookie crumbs":{"i":"Ice Cream Topping 2 LB / chocolate cookie crumbs","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / rainbow sprinkles":{"i":"Ice Cream Topping 2 LB / rainbow sprinkles","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / vanilla cookie crumbs":{"i":"Ice Cream Topping 2 LB / vanilla cookie crumbs","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / brown sprinkles":{"i":"Ice Cream Topping 2 LB / brown sprinkles","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream gelato pan 5 l / cookies n":{"i":"Ice Cream Gelato Pan 5 L / cookies N","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"sherbet gelato pan 5l / passion":{"i":"Sherbet Gelato Pan 5L / passion","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"produce"},"sherbet log cake / strawberry":{"i":"Sherbet Log Cake / strawberry","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log cake / mango":{"i":"Sherbet Log Cake / mango","p":38.0,"v":"Ice Cream Factory","c":"produce"},"standing mini log / ice cream no nuts":{"i":"Standing Mini Log / ice cream NO NUTS","p":2.75,"v":"Ice Cream Factory","c":"dairy"},"sherbet log cake long":{"i":"Sherbet Log Cake Long","p":38.0,"v":"Ice Cream Factory","c":"produce"},"-p ice cream log cake layered":{"i":"-P Ice Cream Log Cake Layered","p":38.0,"v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / mini marshmallows":{"i":"Ice Cream Topping 2 LB / mini marshmallows","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"ice cream topping 2 lb / maraschino cherries":{"i":"Ice Cream Topping 2 LB / maraschino cherries","p":12.0,"w":"2 LB","v":"Ice Cream Factory","c":"dairy"},"salmon fillet sides 3-4 lb (box)":{"i":"Salmon Fillet Sides 3-4 lb (Box)","p":8.39,"w":"4 LB","v":"Sushi Maven","c":"fish"},"oneg gefilte (12 x 3 lb)":{"i":"Oneg Gefilte (12 X 3 lb)","p":153.0,"w":"3 LB","v":"Sushi Maven"},"original gefilte app. (10 x 24 oz)":{"i":"Original Gefilte App. (10 X 24 oz)","p":89.99,"w":"24 OZ","v":"Sushi Maven","c":"beverage"},"lox side presliced box (2 sides)":{"i":"Lox Side Presliced Box (2 Sides)","p":16.49,"v":"Sushi Maven"},"tilapia frozen 5-7 oz 20lb":{"i":"Tilapia Frozen 5-7 oz 20lb","p":77.23,"w":"7 OZ","v":"Sushi Maven","c":"fish"},"tuna loin fresh yellowfin #":{"i":"Tuna Loin Fresh Yellowfin #","p":20.0,"v":"Sushi Maven","c":"fish"},"smoked seabass side presliced":{"i":"Smoked Seabass Side Presliced","p":43.31,"v":"Sushi Maven","c":"fish"},"salmon gefilte app. (10 x 24 oz)":{"i":"Salmon Gefilte App. (10 X 24 oz)","p":89.99,"w":"24 OZ","v":"Sushi Maven","c":"fish"},"creamy smoked nova herring 5lb":{"i":"Creamy Smoked Nova Herring 5lb","p":69.0,"w":"5 LB","v":"Sushi Maven","c":"fish"},"sea bass side fresh":{"i":"Sea Bass Side Fresh","p":36.86,"v":"Sushi Maven","c":"fish"},"sushi salmon side":{"i":"Sushi Salmon Side","p":11.53,"v":"Sushi Maven","c":"fish"},"red snapper frozen 6-8 oz portions 10lb":{"i":"Red Snapper Frozen 6-8 oz Portions 10lb","p":132.15,"w":"8 OZ","v":"Sushi Maven"},".8 spinach gefilte app. (10 x 24 oz)":{"i":".8 Spinach Gefilte App. (10 X 24 oz)","p":100.0,"w":"24 OZ","v":"Sushi Maven","c":"produce"},"spinach gefilte app. (10 x 24 oz)":{"i":"Spinach Gefilte App. (10 X 24 oz)","p":100.0,"w":"24 OZ","v":"Sushi Maven","c":"produce"},"gelling powder (32 oz)":{"i":"Gelling Powder (32 oz)","p":60.0,"w":"32 OZ","v":"Sushi Maven"},"oneg 5 lb":{"i":"ONEG 5 LB","p":28.0,"w":"5 LB","v":"Golden Taste","c":"fish"},"bagel whole wheat":{"i":"Bagel Whole Wheat","p":27.84,"v":"Crusters","c":"bakery"},"bagel plain":{"i":"Bagel Plain","p":27.84,"v":"Crusters","c":"bakery"},"bagel everything":{"i":"Bagel Everything","p":27.84,"v":"Crusters","c":"bakery"},"case mini plain croissant 144/cs":{"i":"Case Mini Plain Croissant 144/cs","p":75.0,"k":"144 CS","v":"Crusters","c":"bakery"},"check ach: (05/27/2026)":{"i":"Check ACH: (05/27/2026)","p":236.99,"v":"Crusters"},"amount paid:":{"i":"Amount Paid:","p":236.99,"v":"Crusters"},"case potato knishes 120/cs":{"i":"Case Potato Knishes 120/cs","p":75.0,"k":"120 CS","v":"Crusters","c":"produce"},"case mini potato knishes 100/cs":{"i":"Case Mini Potato Knishes 100/cs","p":35.0,"k":"100 CS","v":"Crusters","c":"produce"},"case pretzel hot dog bun 54/cs":{"i":"Case Pretzel Hot Dog Bun 54/cs","p":37.8,"k":"54 CS","v":"Crusters"},"-lf 1 pail low fat banana chocolate chip muffin mix":{"i":"-LF 1 Pail Low Fat Banana Chocolate Chip Muffin Mix","p":41.0,"v":"Crusters"},"-lf 1 pail low fat apple cinnamon muffin":{"i":"-LF 1 Pail Low Fat Apple Cinnamon Muffin","p":41.0,"v":"Crusters","c":"bakery"},"-lf 2 pail low fat carrot muffin mix":{"i":"-LF 2 Pail Low Fat Carrot Muffin Mix","p":41.0,"v":"Crusters","c":"produce"},"-lf 3 pail low fat carrot muffin mix":{"i":"-LF 3 Pail Low Fat Carrot Muffin Mix","p":41.0,"v":"Crusters","c":"produce"},"-lf 2 pail low fat apple cinnamon muffin":{"i":"-LF 2 Pail Low Fat Apple Cinnamon Muffin","p":41.0,"v":"Crusters","c":"bakery"},"-lf 2 pail low fat banana chocolate chip muffin mix":{"i":"-LF 2 Pail Low Fat Banana Chocolate Chip Muffin Mix","p":41.0,"v":"Crusters"},"case pretzel hamburger bun 36/cs":{"i":"Case Pretzel Hamburger Bun 36/cs","p":34.66,"k":"36 CS","v":"Crusters"},"check ach: (05/11/2026)":{"i":"Check ACH: (05/11/2026)","p":108.34,"v":"Crusters"},"lovatelli vermoth bianco":{"i":"Lovatelli Vermoth Bianco","p":17.09,"w":"750 ML","v":"Wine on 59"},"lovatelli vermouth rosso":{"i":"Lovatelli Vermouth Rosso","p":17.09,"w":"750 ML","v":"Wine on 59"},"cream tart long filled":{"i":"Cream tart long filled","p":22.0,"v":"Sanders Bakery Monsey","c":"dairy"},"brownie fudge ... cake":{"i":"Brownie fudge ... Cake","p":90.0,"v":"Sanders Bakery Monsey"},"cream puffs lb. eclair":{"i":"Cream Puffs Lb. eclair","p":8.5,"v":"Sanders Bakery Monsey","c":"dairy"},"babka pinwheel round":{"i":"Babka Pinwheel Round","p":16.0,"v":"Sanders Bakery Monsey"},"eclairs lb. lb":{"i":"eclairs LB. LB","p":8.5,"v":"Sanders Bakery Monsey","c":"dairy"},"lb hamantachen":{"i":"Lb Hamantachen","p":8.5,"w":"12 LB","v":"Sanders Bakery Monsey","c":"bakery"},"challah sm small":{"i":"Challah Sm Small","p":3.5,"v":"Sanders Bakery Monsey","c":"bakery"},"ses sticks sesame":{"i":"Ses Sticks Sesame","p":1.0,"v":"Sanders Bakery Monsey"},"mix of baked ... goods 1,100.00 1,100.00t":{"i":"Mix of Baked ... Goods 1,100.00 1,100.00T","p":1100.0,"v":"Sanders Bakery Monsey"},"\" cheese cake... cake 8\"":{"i":"\" Cheese Cake... Cake 8\"","p":28.0,"v":"Sanders Bakery Monsey","c":"dairy"},"bottle decorating sauce / caramel":{"i":"Bottle Decorating Sauce / Caramel","p":12.0,"v":"Ice Cream Factory"},"sherbet log / mango":{"i":"Sherbet Log / mango","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log / strawberry":{"i":"Sherbet Log / strawberry","p":38.0,"v":"Ice Cream Factory","c":"produce"},"-p ice cream log / vanilla":{"i":"-P Ice Cream Log / vanilla","p":38.0,"v":"Ice Cream Factory","c":"dairy"},"-p ice cream log / cookies n":{"i":"-P Ice Cream Log / cookies N","p":38.0,"v":"Ice Cream Factory","c":"dairy"},"sherbet log / lemon":{"i":"Sherbet Log / Lemon","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log / raspberry":{"i":"Sherbet Log / raspberry","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log / passion":{"i":"Sherbet Log / passion","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet pop classic":{"i":"Sherbet Pop Classic","p":1.5,"v":"Ice Cream Factory","c":"produce"},"sherbet log cake long / lemon":{"i":"Sherbet Log Cake Long / lemon","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log cake long / raspberry":{"i":"Sherbet Log Cake Long / raspberry","p":38.0,"v":"Ice Cream Factory","c":"produce"},"sherbet log cake long / passion":{"i":"Sherbet Log Cake Long / passion","p":38.0,"v":"Ice Cream Factory","c":"produce"},"small mango burst":{"i":"Small Mango Burst","p":2.5,"v":"Ice Cream Factory"},"ice cream gelato pan 5 l / chocolate":{"i":"Ice Cream Gelato Pan 5 L / chocolate","p":28.0,"w":"5 L","v":"Ice Cream Factory","c":"dairy"},"tilapia frozen 7-9 oz 20lb":{"i":"Tilapia Frozen 7-9 oz 20lb","p":101.0,"w":"9 OZ","v":"Sushi Maven","c":"fish"},"tuna loin fresh bluefin #":{"i":"Tuna Loin Fresh Bluefin #","p":24.0,"v":"Sushi Maven","c":"fish"},"hamachi yellowtail 4-5 lb":{"i":"Hamachi Yellowtail 4-5 lb","p":17.41,"w":"5 LB","v":"Sushi Maven"},"halibut fillet side fresh":{"i":"Halibut Fillet Side Fresh","p":24.23,"v":"Sushi Maven","c":"fish"},"crc 2 lb":{"i":"CRC 2 LB","p":48.0,"w":"2 LB","v":"Golden Taste"},"bagel plain x48 (case/48)":{"i":"Bagel Plain x48 (Case/48)","p":27.84,"v":"Crusters","c":"bakery"},"bagel everything x48 (case/48)":{"i":"Bagel Everything x48 (Case/48)","p":27.84,"v":"Crusters","c":"bakery"},"bagel whole wheat x48 (case/48)":{"i":"Bagel Whole Wheat x48 (Case/48)","p":27.84,"v":"Crusters","c":"bakery"},"the cave mevushel 750 ml":{"i":"The Cave Mevushel 750 ML","p":95.15,"w":"750 ML","v":"Wine on 59"},"herzog rutherford 750 ml":{"i":"Herzog Rutherford 750 ML","p":83.99,"w":"750 ML","v":"Wine on 59","c":"beverage"},"shiloh mosaic 750 ml":{"i":"Shiloh Mosaic 750 ML","p":53.81,"w":"750 ML","v":"Wine on 59"},"padis brilliance 750 ml":{"i":"Padis Brilliance 750 ML","p":84.99,"w":"750 ML","v":"Wine on 59"},"barkan superieur cab 750 ml":{"i":"Barkan Superieur Cab 750 ML","p":62.39,"w":"750 ML","v":"Wine on 59","c":"beverage"},"chateau roubine rose 750 ml":{"i":"Chateau Roubine Rose 750 ML","p":21.05,"w":"750 ML","v":"Wine on 59","c":"beverage"},"herzog s/r chardonnay 750ml":{"i":"Herzog S/R Chardonnay 750ml","p":28.79,"w":"750 ML","v":"Wine on 59","c":"beverage"},"les marronniers chablis 750 ml":{"i":"Les Marronniers Chablis 750 ML","p":28.07,"w":"750 ML","v":"Wine on 59"},"segals unfiltered cab 750 ml":{"i":"Segals Unfiltered Cab 750 ML","p":85.01,"w":"750 ML","v":"Wine on 59"},"pa ball mix 30-lb (usa) bgan lb":{"i":"PA BALL MIX 30-LB (USA) BGAN LB","p":67.75,"v":"Newburg Foods"},"ca milk 12/32 oz":{"i":"CA MILK 12/32 OZ","p":40.9,"w":"32 OZ","v":"Newburg Foods","c":"dairy"},"ca oil 15/1 bgan lit":{"i":"CA OIL 15/1 BGAN LIT","p":226.9,"v":"Newburg Foods"},"ca pc 60/1 oz bgan":{"i":"CA PC 60/1 OZ BGAN","p":15.9,"w":"1 OZ","v":"Newburg Foods"},"cake platter":{"i":"Cake Platter","p":15.0,"v":"Sanders Bakery Monsey","c":"bakery"},"cin cinnamon bun roaster":{"i":"CIN cinnamon bun roaster","p":40.0,"v":"Sanders Bakery Monsey"},"birthday cake decorated":{"i":"Birthday Cake Decorated","p":35.0,"v":"Sanders Bakery Monsey","c":"bakery"},"loop ice cream / chocolate":{"i":"Loop Ice Cream / Chocolate","p":3.75,"v":"Ice Cream Factory","c":"dairy"},"triple cylinder round / sorbet":{"i":"Triple Cylinder Round / sorbet","p":4.5,"v":"Ice Cream Factory","c":"beverage"},"napoleon ice cream cake":{"i":"Napoleon Ice Cream Cake","p":4.5,"v":"Ice Cream Factory","c":"dairy"},"ice shake / mango":{"i":"Ice Shake / mango","p":2.75,"v":"Ice Cream Factory","c":"beverage"},"ice shake / strawberry":{"i":"Ice Shake / strawberry","p":2.75,"v":"Ice Cream Factory","c":"beverage"},"ice shake / lotus":{"i":"Ice Shake / lotus","p":2.75,"v":"Ice Cream Factory","c":"beverage"},"ice shake / cookies n cream":{"i":"Ice Shake / cookies N cream","p":2.75,"v":"Ice Cream Factory","c":"dairy"},"lox salad 5lb":{"i":"Lox Salad 5lb","p":55.0,"w":"5 LB","v":"Sushi Maven","c":"produce"},"white fish salad 5lb":{"i":"White Fish Salad 5lb","p":65.0,"w":"5 LB","v":"Sushi Maven","c":"fish"},"oneg gefilte frozen cooked (12 x 3 lb)":{"i":"Oneg Gefilte Frozen Cooked (12 X 3 lb)","p":180.0,"w":"3 LB","v":"Sushi Maven"},"kishke original frozen cooked (12 x 3 lb)":{"i":"Kishke Original Frozen Cooked (12 X 3 lb)","p":96.0,"w":"3 LB","v":"Sushi Maven","c":"beverage"},".5 salmon fillet sides 3-4 lb (box)":{"i":".5 Salmon Fillet Sides 3-4 lb (Box)","p":8.71,"w":"4 LB","v":"Sushi Maven","c":"fish"},"white fish slices":{"i":"White Fish Slices","p":8.99,"v":"Sushi Maven","c":"fish"},"spinach gefilte app. frozen cooked (10 x 24 oz)":{"i":"Spinach Gefilte App. Frozen Cooked (10 X 24 oz)","p":110.0,"w":"24 OZ","v":"Sushi Maven","c":"produce"},"ca argo corn 24/16 oz":{"i":"CA ARGO CORN 24/16 OZ","p":51.8,"w":"16 OZ","v":"Newburg Foods"},"ca all lb":{"i":"CA ALL LB","p":34.2,"v":"Newburg Foods"},"chicken legs skin-on":{"i":"Chicken Legs Skin-On","p":6.49,"u":"lb","w":"5 LB","k":"2/5 LB","v":"Springfield Group","c":"meat"},"chicken breast boneless blucut":{"i":"Chicken Breast Boneless BluCut","p":5.99,"u":"lb","v":"Springfield Group","c":"meat"},"ground beef":{"i":"Ground Beef","p":104.99,"u":"case","w":"20 LB","k":"20 LB","v":"Springfield Group","c":"meat"},"solomon's junior franks bulk":{"i":"Solomon's Junior Franks Bulk","p":59.88,"u":"case","w":"5 LB","k":"2/5 LB","v":"Springfield Group","c":"meat"},"solomon's franks 10s beis yosef":{"i":"Solomon's Franks 10s Beis Yosef","p":59.88,"u":"case","v":"Springfield Group","c":"meat"},"solomon's franks 8 to a lb":{"i":"Solomon's Franks 8 to a LB","p":65.87,"u":"case","w":"5 LB","k":"2/5 LB","v":"Springfield Group","c":"meat"},"spicy mexican style chorizo":{"i":"Spicy Mexican Style Chorizo","p":112.79,"u":"case","v":"Springfield Group","c":"meat"},"mexican style chorizo":{"i":"Mexican Style Chorizo","p":112.79,"u":"case","v":"Springfield Group","c":"meat"},"plate trimmed pastrami glatt kosher":{"i":"Plate Trimmed Pastrami Glatt Kosher","p":10.5,"u":"lb","v":"Springfield Group","c":"meat"},"empanada beef":{"i":"Empanada Beef","p":127.0,"u":"case","v":"Springfield Group","c":"meat"},"cocktail eggrolls":{"i":"Cocktail Eggrolls","p":31.0,"u":"case","v":"Springfield Group","c":"meat"},"rock cornish hen":{"i":"Rock Cornish Hen","p":34.4,"u":"case","v":"Springfield Group","c":"meat"},"atlantic salmon fillet 3-4 lb":{"i":"Atlantic Salmon Fillet 3-4 LB","p":155.0,"u":"case","k":"3-4 LB","v":"Springfield Group","c":"fish"},"whole milk":{"i":"Whole Milk","p":3.0,"v":"Devash Farms","c":"dairy"},"1% milk":{"i":"1% Milk","p":3.0,"v":"Devash Farms","c":"dairy"},"cream cheese 5 lb":{"i":"Cream Cheese 5 LB","p":20.0,"w":"5 LB","v":"Devash Farms","c":"dairy"},"dairy ice cream vanilla 3 gallon tub":{"i":"Dairy Ice Cream Vanilla 3 Gallon Tub","p":43.0,"v":"Aaron Sprinkles","c":"dairy"},"dairy ice cream chocolate 3 gallon tub":{"i":"Dairy Ice Cream Chocolate 3 Gallon Tub","p":43.0,"v":"Aaron Sprinkles","c":"dairy"}};

// Expand compressed format back to full objects
const SEED_PRICES = {};
Object.entries(SEED).forEach(([k,v]) => {
  SEED_PRICES[k] = {
    item:v.i||k, price:v.p||0, unit:v.u||'unit',
    weight:v.w||'', pack:v.k||'', vendorName:v.v||'',
    category:v.c||'dry', updatedAt:v.d||'', source:'invoice-import'
  };
});

// ─── IN-MEMORY STORE (session-safe, no browser storage APIs) ─────────────────
const MEM = {};
const store = {
  get: (k,d) => k in MEM ? MEM[k] : d,
  set: (k,v) => { MEM[k]=v; },
};

// ─── DEFAULT VENDORS (pre-named from your real invoices) ─────────────────────
const DEFAULT_VENDORS = {
  // Multiple vendors per category — manager can add phone/email and set preferred contact method
  meat:     [
    {id:"m1",  name:"Springfield Group",     phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  fish:     [
    {id:"f1",  name:"Sushi Maven",           phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"f2",  name:"Golden Taste",          phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"f3",  name:"Weissabi Sushi",        phone:"", email:"", contactMethod:"email",    dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"f4",  name:"Springfield Group",     phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  dairy:    [
    {id:"d1",  name:"Devash Farms",          phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"d2",  name:"Newburg Foods",         phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"d3",  name:"Aaron Sprinkles",       phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  produce:  [
    {id:"p1",  name:"J.Papas & Sons",        phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"p2",  name:"AJE Produce",           phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"p3",  name:"Golden Taste",          phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  dry:      [
    {id:"dr1", name:"Bertram",               phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"dr2", name:"Chef Kingdom",          phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  bakery:   [
    {id:"b1",  name:"Sanders Bakery Monsey", phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"b2",  name:"Crusters",              phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
  beverage: [
    {id:"bv1", name:"To Life Water",         phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"bv2", name:"Wine on 59",            phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
    {id:"bv3", name:"Bertram",               phone:"", email:"", contactMethod:"whatsapp", dept:["Restaurant","Catering"], pricePerUnit:0},
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const genId  = () => Math.random().toString(36).slice(2,8);
const today  = () => new Date().toLocaleDateString("en-GB");
const usd    = (n) => n>0 ? "$"+Number(n).toFixed(2) : "";

const findPrice = (name, db) => {
  const key = name.toLowerCase().trim();
  if (db[key]) return db[key];
  const words = key.split(" ").filter(w=>w.length>3);
  if (words.length >= 2) {
    for (const k of Object.keys(db)) {
      if (words.every(w=>k.includes(w))) return db[k];
    }
  }
  return null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── CORE STATE
  const [mode,     setMode]     = useState("staff");
  const [dept,     setDept]     = useState("Restaurant");
  const [vendors,  setVendors]  = useState(() => store.get("vendors", DEFAULT_VENDORS));
  const [priceDB,  setPriceDB]  = useState(() => { const s=store.get("prices",null); if(s&&Object.keys(s).length>0)return s; store.set("prices",SEED_PRICES); return SEED_PRICES; });
  const [history,  setHistory]  = useState(() => store.get("history",[]));
  const [priceLog, setPriceLog] = useState(() => store.get("pricelog",{}));

  // ── STAFF STATE
  const [step,     setStep]     = useState("home");
  const [items,    setItems]    = useState([]);
  const [photo,    setPhoto]    = useState(null);
  const [sent,     setSent]     = useState([]);

  // ── MANAGER STATE
  const [tab,      setTab]      = useState("dashboard");
  const [pinOk,    setPinOk]    = useState(false);
  const [pinVal,   setPinVal]   = useState("");
  const [editV,    setEditV]    = useState(null);
  const [vDraft,   setVDraft]   = useState({});
  const [delConf,  setDelConf]  = useState(null);
  const [emailTxt, setEmailTxt] = useState("");
  const [emailBusy,setEmailBusy]= useState(false);
  const [emailRes, setEmailRes] = useState(null);
  const [pSearch,  setPSearch]  = useState("");
  const [pCat,     setPCat]     = useState("all");
  const [pVend,    setPVend]    = useState("All");
  const [pPage,    setPPage]    = useState(1);
  const [pSort,    setPSort]    = useState({col:"item",dir:"asc"});
  const [wkey]     = useState(() => { const k=store.get("wkey",""); if(k)return k; const nk="hk_"+Math.random().toString(36).slice(2,12); store.set("wkey",nk); return nk; });
  const [toast,    setToast]    = useState(null);

  const cameraRef = useRef();
  const fileRef   = useRef();

  const PIN = "1234"; // change before going live

  // ── SAVE HELPERS
  const saveVendors = v => { setVendors(v); store.set("vendors",v); };
  const savePrices  = p => { setPriceDB(p);  store.set("prices",p); };
  const saveHistory = h => { setHistory(h);  store.set("history",h); };

  // ── TOAST
  const toast_ = (msg,t="ok") => { setToast({msg,t}); setTimeout(()=>setToast(null),3500); };

  // ── REFRESH GUARD
  useEffect(() => {
    const h=(e)=>{ if(items.length>0&&step!=="home"){e.preventDefault();e.returnValue="";} };
    window.addEventListener("beforeunload",h);
    return ()=>window.removeEventListener("beforeunload",h);
  },[items.length,step]);

  // ── VENDOR HELPERS
  const allV    = Object.values(vendors).flat();
  const catV    = (cid) => (vendors[cid]||[]).filter(v=>v.name&&(v.phone||v.email)&&v.dept.includes(dept));
  const bestV   = (cid) => { const e=catV(cid); const w=e.filter(v=>v.pricePerUnit>0).sort((a,b)=>a.pricePerUnit-b.pricePerUnit); return w[0]||e[0]||null; };

  // ── GROUP ITEMS BY VENDOR
  const grouped = useMemo(() => {
    const map={};
    items.forEach(item=>{
      const key=item.vendorId||"__none";
      if(!map[key])map[key]={vendor:allV.find(v=>v.id===item.vendorId)||null,items:[]};
      map[key].items.push(item);
    });
    return Object.values(map);
  },[items, allV.length]);

  // ── BUILD MESSAGE
  const buildMsg = (group) => {
    const v=group.vendor;
    const wa=(v?.contactMethod||"whatsapp")==="whatsapp";
    const b=(s)=>wa?"*"+s+"*":s;
    let m=wa?"🏨 "+b("Sleepy Hollow Hotel — "+dept+" Order")+"\n📅 "+today()+"\n\n"
            :"Sleepy Hollow Hotel — "+dept+" Order\nDate: "+today()+"\n\n";
    group.items.forEach(i=>{
      m+="• "+i.name+": "+b(i.qty+" "+i.unit);
      if(i.price>0)m+=" ("+usd(i.price)+")";
      m+="\n";
    });
    return m;
  };

  // ── SEND ORDER
  const sendOrder = (group) => {
    const v=group.vendor;
    if(!v?.id||sent.includes(v.id))return;
    const msg=buildMsg(group);
    const method=v.contactMethod||"whatsapp";
    if(method==="whatsapp"){
      const ph=(v.phone||"").replace(/[^0-9]/g,"");
      window.open("https://wa.me/"+ph+"?text="+encodeURIComponent(msg),"_blank");
    } else if(method==="sms"){
      const ph=(v.phone||"").replace(/[^0-9]/g,"");
      window.open("sms:"+ph+"?body="+encodeURIComponent(msg),"_blank");
    } else {
      const sub=encodeURIComponent("Hotel Food Order — "+dept+" — "+today());
      window.open("mailto:"+(v.email||"")+"?subject="+sub+"&body="+encodeURIComponent(msg),"_blank");
    }
    setSent(p=>[...p,v.id]);
  };

  const sendBtn = (v) => {
    const m=CONTACT.find(c=>c.id===(v?.contactMethod||"whatsapp"))||CONTACT[0];
    const ok=v?.contactMethod==="email"?!!(v?.email?.includes("@")):(v?.phone||"").length>5;
    return {...m,ok};
  };

  // ── SCAN PHOTO
  const scan = async (e) => {
    const file=e.target.files?.[0];
    if(!file)return;
    setStep("scanning"); setPhoto(URL.createObjectURL(file));
    const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
    const isPdf=file.type==="application/pdf";
    const mediaBlock=isPdf
      ?{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}}
      :{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}};
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:1000,
          messages:[{role:"user",content:[
            mediaBlock,
            {type:"text",text:"This is a kosher hotel kitchen order note. Extract every food item listed.\nReturn ONLY a JSON array, no markdown:\n[{\"name\":\"item name\",\"qty\":\"number\",\"unit\":\"kg|L|units|packs|cases|lb\",\"category\":\"meat|fish|dairy|produce|dry|bakery|beverage\"}]\nIf qty missing use \"1\". If unit unclear use \"kg\" for food, \"units\" for countable, \"L\" for liquids."}
          ]}]
        })
      });
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"[]";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      if(!parsed||!parsed.length){toast_("No items found — retake photo clearly","err");setStep("home");e.target.value="";return;}
      setItems(parsed.map(it=>{
        const v=bestV(it.category);
        const pr=findPrice(it.name,priceDB);
        return {id:genId(),name:it.name,qty:it.qty||"1",unit:it.unit||"units",catId:it.category,vendorId:v?.id||null,vendorName:v?.name||null,price:pr?.price||0,weight:pr?.weight||"",pack:pr?.pack||""};
      }));
      setStep("review");
    } catch(err){toast_("Could not read — check connection and retry","err");setStep("home");}
    e.target.value="";
  };

  const reset = () => { setStep("home");setItems([]);setPhoto(null);setSent([]); };
  const addItem = () => {
    const v=bestV("dry");
    setItems(p=>[...p,{id:genId(),name:"New item",qty:"1",unit:"units",catId:"dry",vendorId:v?.id||null,vendorName:v?.name||null,price:0,weight:"",pack:""}]);
  };
  const finish = () => { saveHistory([{id:genId(),date:today(),dept,items},...history].slice(0,300)); toast_("Order saved"); };
  const allSent = grouped.filter(g=>g.vendor).length>0 && sent.length>=grouped.filter(g=>g.vendor).length;

  // ── EMAIL IMPORT
  const parseEmail = async () => {
    if(!emailTxt.trim())return;
    setEmailBusy(true);setEmailRes(null);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",max_tokens:1000,
          messages:[{role:"user",content:"Extract all food items with prices from this kosher vendor email.\nReturn ONLY a JSON array, no markdown:\n[{\"item\":\"name\",\"price\":0.00,\"unit\":\"kg|L|unit|pack|case|lb\",\"weight\":\"e.g. 5 LB\",\"pack\":\"e.g. 12/CS\",\"vendorName\":\"vendor\",\"category\":\"meat|fish|dairy|produce|dry|bakery|beverage\"}]\nIf a field unknown use empty string. Price must be a number.\n\nEmail:\n"+emailTxt.slice(0,4000)}]
        })
      });
      const data=await res.json();
      const raw=data.content?.map(b=>b.text||"").join("")||"[]";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      const newDB={...priceDB};
      const newLog={...priceLog};
      const changes=[];
      parsed.forEach(row=>{
        if(!row.item||!row.price)return;
        const key=row.item.toLowerCase().trim();
        const prev=newDB[key];
        const newPrice=parseFloat(row.price);
        let change=null;
        if(prev&&prev.price&&prev.price!==newPrice){
          const pct=((newPrice-prev.price)/prev.price)*100;
          change={from:prev.price,to:newPrice,pct};
          if(!newLog[key])newLog[key]=[{price:prev.price,date:prev.updatedAt||"earlier",vendor:prev.vendorName||""}];
          newLog[key].push({price:newPrice,date:today(),vendor:row.vendorName||""});
        }
        newDB[key]={item:row.item,price:newPrice,prevPrice:prev?.price||null,unit:row.unit||"unit",weight:row.weight||"",pack:row.pack||"",vendorName:row.vendorName||(prev?.vendorName||""),category:row.category||"dry",updatedAt:today(),source:"email-import"};
        changes.push({...newDB[key],change});
      });
      savePrices(newDB);
      setPriceLog(newLog);store.set("pricelog",newLog);
      setEmailRes({count:parsed.length,items:changes});
      setEmailTxt("");
      toast_(parsed.length+" prices updated");
    } catch{toast_("Could not parse email — try again","err");}
    setEmailBusy(false);
  };

  // ── VENDOR MGMT
  const saveVendor = () => {
    if(!editV)return;
    const {cid,id}=editV;
    const upd={...vendors,[cid]:(vendors[cid]||[]).map(v=>v.id===id?{...v,...vDraft}:v)};
    saveVendors(upd);setEditV(null);toast_("Vendor saved");
  };
  const addVendor = (cid) => {
    const nv={id:genId(),name:"",phone:"",email:"",contactMethod:"whatsapp",dept:["Restaurant","Catering"],pricePerUnit:0};
    saveVendors({...vendors,[cid]:[...(vendors[cid]||[]),nv]});
    setEditV({cid,id:nv.id});setVDraft({name:"",phone:"",email:"",contactMethod:"whatsapp",dept:["Restaurant","Catering"],pricePerUnit:0});
  };
  const delVendor = (cid,id) => {
    if(delConf!==id){setDelConf(id);setTimeout(()=>setDelConf(c=>c===id?null:c),4000);return;}
    saveVendors({...vendors,[cid]:(vendors[cid]||[]).filter(v=>v.id!==id)});
    setDelConf(null);setEditV(null);toast_("Vendor removed");
  };

  // ── PRICE TABLE
  const priceList = Object.values(priceDB);
  const vendorList = ["All",...new Set(priceList.map(p=>p.vendorName).filter(Boolean)).values()].sort();
  const filtered = useMemo(()=>{
    let d=priceList;
    if(pCat!=="all")d=d.filter(p=>p.category===pCat);
    if(pVend!=="All")d=d.filter(p=>p.vendorName===pVend);
    if(pSearch.trim())d=d.filter(p=>(p.item||"").toLowerCase().includes(pSearch.toLowerCase())||(p.vendorName||"").toLowerCase().includes(pSearch.toLowerCase()));
    return [...d].sort((a,b)=>{
      const va=pSort.col==="price"?a.price:(a[pSort.col]||"");
      const vb=pSort.col==="price"?b.price:(b[pSort.col]||"");
      const cmp=typeof va==="number"?va-vb:String(va).localeCompare(String(vb));
      return pSort.dir==="asc"?cmp:-cmp;
    });
  },[priceList.length,pCat,pVend,pSearch,pSort,priceDB]);
  const PP=50,totalPg=Math.ceil(filtered.length/PP),pageData=filtered.slice((pPage-1)*PP,pPage*PP);
  const sortBy=(col)=>{setPSort(s=>s.col===col?{...s,dir:s.dir==="asc"?"desc":"asc"}:{col,dir:"asc"});setPPage(1);};
  const arr=(col)=>pSort.col===col?(pSort.dir==="asc"?" ↑":" ↓"):"";

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#F4F3EF",fontFamily:"Helvetica Neue,Arial,sans-serif",color:"#111",fontSize:14}}>
      <style>{"*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer}input,select,textarea{font-family:inherit}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}"}</style>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"10px 22px",borderRadius:30,fontSize:14,fontWeight:700,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.3)",animation:"pop .2s",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* HEADER */}
      <div style={{background:"#111",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#C8A84B",fontSize:9,letterSpacing:3,textTransform:"uppercase"}}>✡ Sleepy Hollow Hotel</div>
          <div style={{color:"#fff",fontSize:16,fontWeight:800}}>Food Ordering</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {mode==="staff"&&["Restaurant","Catering"].map(d=>(
            <button key={d} onClick={()=>setDept(d)} style={{padding:"5px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,background:dept===d?"#C8A84B":"#2a2a2a",color:dept===d?"#111":"#777"}}>
              {d==="Restaurant"?"🍽":"🎪"} {d}
            </button>
          ))}
          <div style={{width:1,height:20,background:"#333",margin:"0 4px"}}/>
          <button onClick={()=>{if(mode==="staff")setMode("manager");else{setMode("staff");setPinOk(false);setPinVal("");}}} style={{padding:"5px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,background:"#2a2a2a",color:"#C8A84B"}}>
            {mode==="staff"?"⚙️ Manager":"← Staff"}
          </button>
        </div>
      </div>

      {/* ══ STAFF ══════════════════════════════════════════════════════════ */}
      {mode==="staff"&&(
        <div style={{maxWidth:480,margin:"0 auto",padding:20}}>

          {step==="home"&&(
            <div style={{textAlign:"center",paddingTop:40}}>
              <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>What do you need to order?</div>
              <div style={{color:"#888",marginBottom:48}}>Take a photo of the list</div>
              <div style={{marginBottom:40}}>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={scan}/>
                <button onClick={()=>cameraRef.current?.click()} style={{width:200,height:200,borderRadius:"50%",border:"none",background:"#C8A84B",fontSize:64,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"0 auto",boxShadow:"0 8px 40px rgba(200,168,75,.5)"}}
                  onMouseDown={e=>e.currentTarget.style.transform="scale(.95)"}
                  onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>📷</button>
                <div style={{marginTop:16,fontWeight:700,fontSize:18}}>Take a photo</div>
                <div style={{color:"#999",fontSize:13,marginTop:4}}>Handwritten note, printed list, anything</div>
              </div>
              <div style={{borderTop:"1px solid #E0DDD6",paddingTop:24,display:"flex",gap:10,justifyContent:"center"}}>
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={scan}/>
                <button onClick={()=>fileRef.current?.click()} style={{background:"none",border:"1.5px solid #ddd",borderRadius:12,padding:"10px 20px",fontWeight:600,color:"#666"}}>📁 Upload file</button>
                <button onClick={()=>{addItem();setStep("review");}} style={{background:"none",border:"1.5px solid #ddd",borderRadius:12,padding:"10px 20px",fontWeight:600,color:"#666"}}>✏️ Type order</button>
              </div>
            </div>
          )}

          {step==="scanning"&&(
            <div style={{textAlign:"center",paddingTop:80}}>
              {photo&&<img src={photo} style={{width:200,height:200,objectFit:"cover",borderRadius:20,marginBottom:30}} alt=""/>}
              <div style={{fontSize:48,display:"inline-block",animation:"spin 1s linear infinite"}}>⏳</div>
              <div style={{fontWeight:800,fontSize:20,marginTop:16}}>Reading the list...</div>
              <div style={{color:"#888",marginTop:4}}>AI is scanning every item</div>
            </div>
          )}

          {step==="review"&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                {photo&&<img src={photo} style={{width:52,height:52,objectFit:"cover",borderRadius:10}} alt=""/>}
                <div>
                  <div style={{fontWeight:800,fontSize:18}}>Review order</div>
                  <div style={{color:"#888",fontSize:13}}>{items.length} items · {dept}</div>
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                {items.map((item)=>{
                  const cat=CATS.find(c=>c.id===item.catId);
                  return (
                    <div key={item.id} style={{background:"#fff",borderRadius:12,padding:"9px 12px",border:"1.5px solid #E0DDD6",display:"flex",alignItems:"center",gap:8}}>
                      <select value={item.catId} title="Change category"
                        onChange={e=>{const nv=bestV(e.target.value);setItems(p=>p.map(x=>x.id===item.id?{...x,catId:e.target.value,vendorId:nv?.id||null,vendorName:nv?.name||null}:x));}}
                        style={{fontSize:18,border:"none",background:"none",cursor:"pointer",width:30,padding:0}}>
                        {CATS.map(c=><option key={c.id} value={c.id}>{c.icon}</option>)}
                      </select>
                      <div style={{flex:1}}>
                        <input type="text" value={item.name}
                          onChange={e=>setItems(p=>p.map(x=>x.id===item.id?{...x,name:e.target.value}:x))}
                          style={{fontWeight:700,fontSize:14,border:"none",background:"none",width:"100%",padding:0}}/>
                        <div style={{fontSize:11,color:"#888"}}>
                          {item.vendorName?<span style={{color:"#25D366"}}>→ {item.vendorName}</span>:<span style={{color:"#E74C3C"}}>⚠ No vendor set</span>}
                          {item.price>0&&<span style={{marginLeft:8}}>{usd(item.price)}</span>}
                          {item.weight&&<span style={{marginLeft:8,color:"#aaa"}}>{item.weight}</span>}
                        </div>
                      </div>
                      <input type="number" inputMode="decimal" min="0" value={item.qty}
                        onChange={e=>setItems(p=>p.map(x=>x.id===item.id?{...x,qty:e.target.value}:x))}
                        style={{width:56,padding:"6px",borderRadius:8,border:"1.5px solid #ddd",fontSize:16,fontWeight:700,textAlign:"center"}}/>
                      <select value={item.unit}
                        onChange={e=>setItems(p=>p.map(x=>x.id===item.id?{...x,unit:e.target.value}:x))}
                        style={{padding:"6px 4px",borderRadius:8,border:"1.5px solid #ddd",fontSize:11,width:60}}>
                        {["kg","g","lb","L","ml","units","packs","cases","dozen"].map(u=><option key={u}>{u}</option>)}
                      </select>
                      <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:"#ddd",fontSize:18,flexShrink:0}}>✕</button>
                    </div>
                  );
                })}
              </div>

              <button onClick={addItem} style={{width:"100%",marginBottom:10,padding:11,borderRadius:10,border:"1.5px dashed #C8A84B",background:"#FFFDF5",color:"#9A7B1E",fontWeight:700}}>+ Add item manually</button>

              <button onClick={()=>{
                const blank=items.filter(it=>!it.qty||Number(it.qty)<=0);
                if(blank.length){toast_(blank.length+" item(s) have no quantity — fix or remove","err");return;}
                setStep("sending");
              }} style={{width:"100%",padding:15,borderRadius:12,border:"none",background:"#C8A84B",color:"#111",fontWeight:800,fontSize:17,boxShadow:"0 4px 20px rgba(200,168,75,.4)"}}>
                Send Orders →
              </button>
              <button onClick={reset} style={{width:"100%",marginTop:8,padding:11,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontWeight:600}}>Start over</button>
            </div>
          )}

          {step==="sending"&&(
            <div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Send to vendors</div>
              <div style={{color:"#888",fontSize:13,marginBottom:10}}>Each vendor receives via their preferred method</div>
              <div style={{background:"#FEF9EC",border:"1.5px solid #C8A84B",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#7A5C00",marginBottom:16,fontWeight:600}}>
                ⓘ Keep this tab open while sending. Tap each button, send the message, come back here.
              </div>

              {items.length===0&&(
                <div style={{textAlign:"center",padding:40,color:"#888"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📋</div>
                  <div style={{fontWeight:700}}>Order list is empty</div>
                  <button onClick={reset} style={{marginTop:14,background:"#C8A84B",color:"#111",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:700}}>New order</button>
                </div>
              )}

              {grouped.map((g,i)=>{
                const isSent=g.vendor?.id?sent.includes(g.vendor.id):false;
                const btn=sendBtn(g.vendor);
                return (
                  <div key={i} style={{background:"#fff",borderRadius:12,marginBottom:10,overflow:"hidden",border:"2px solid "+(isSent?"#86EFAC":"#E0DDD6")}}>
                    <div style={{background:isSent?"#F0FDF4":"#111",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div>
                        <div style={{color:isSent?"#15803D":"#fff",fontWeight:800,fontSize:15}}>{g.vendor?.name||"⚠ No vendor assigned"}</div>
                        <div style={{color:isSent?"#4ADE80":"#888",fontSize:12}}>
                          {g.items.length} item{g.items.length>1?"s":""}
                          {g.vendor&&!isSent&&<span style={{marginLeft:8,color:"#aaa",fontSize:11}}>via {btn.icon} {btn.label}</span>}
                        </div>
                      </div>
                      {isSent
                        ?<div style={{background:"#15803D",color:"#fff",borderRadius:20,padding:"6px 14px",fontWeight:800,fontSize:13}}>✓ Sent</div>
                        :g.vendor&&btn.ok
                          ?<button onClick={()=>sendOrder(g)} style={{background:btn.bg,color:btn.fg,border:"none",borderRadius:10,padding:"10px 18px",fontWeight:800}}>{btn.icon} {btn.label}</button>
                          :<button onClick={()=>{setMode("manager");setTab("vendors");}} style={{background:"#FEF3C7",color:"#92400E",border:"none",borderRadius:8,padding:"8px 12px",fontWeight:700,fontSize:12}}>Set up vendor →</button>
                      }
                    </div>
                    <div style={{padding:"6px 16px"}}>
                      {g.items.map((it,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #F4F3EF"}}>
                          <span>{CATS.find(c=>c.id===it.catId)?.icon} {it.name}</span>
                          <span style={{fontFamily:"monospace",fontWeight:700}}>{it.qty} {it.unit}{it.price>0?" · "+usd(it.price):""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {allSent&&(
                <div style={{background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:14,padding:24,textAlign:"center",marginTop:8,animation:"pop .3s"}}>
                  <div style={{fontSize:48,marginBottom:8}}>✅</div>
                  <div style={{fontWeight:800,fontSize:20,color:"#15803D",marginBottom:4}}>All done!</div>
                  <div style={{color:"#888",marginBottom:16}}>All vendors notified</div>
                  <button onClick={()=>{finish();reset();}} style={{background:"#15803D",color:"#fff",border:"none",borderRadius:12,padding:"14px 32px",fontWeight:800,fontSize:16}}>New order</button>
                </div>
              )}

              {!allSent&&items.length>0&&<button onClick={()=>setStep("review")} style={{width:"100%",marginTop:8,padding:11,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontWeight:600}}>← Back to review</button>}
            </div>
          )}
        </div>
      )}

      {/* ══ MANAGER PIN GATE ════════════════════════════════════════════════ */}
      {mode==="manager"&&!pinOk&&(
        <div style={{maxWidth:340,margin:"60px auto",padding:24,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔒</div>
          <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Manager Access</div>
          <div style={{color:"#888",marginBottom:24}}>Enter PIN to access vendors, prices, and settings.</div>
          <input type="password" inputMode="numeric" placeholder="• • • •"
            value={pinVal} onChange={e=>setPinVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){if(pinVal===PIN)setPinOk(true);else{toast_("Wrong PIN","err");setPinVal("");}}}}
            style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #C8A84B",fontSize:24,textAlign:"center",letterSpacing:8,marginBottom:12}}/>
          <button onClick={()=>{if(pinVal===PIN)setPinOk(true);else{toast_("Wrong PIN","err");setPinVal("");}}}
            style={{width:"100%",padding:14,borderRadius:12,border:"none",background:"#C8A84B",color:"#111",fontWeight:800,fontSize:16}}>Unlock</button>
          <button onClick={()=>{setMode("staff");setPinVal("");}}
            style={{width:"100%",marginTop:8,padding:11,borderRadius:10,border:"1.5px solid #ddd",background:"#fff",color:"#888",fontWeight:600}}>← Back to staff</button>
          <div style={{marginTop:14,fontSize:11,color:"#bbb"}}>Default PIN: 1234 — change before going live</div>
        </div>
      )}

      {/* ══ MANAGER ════════════════════════════════════════════════════════ */}
      {mode==="manager"&&pinOk&&(
        <div>
          <div style={{background:"#fff",borderBottom:"1px solid #E0DDD6",display:"flex",overflowX:"auto"}}>
            {[{id:"dashboard",l:"📊 Overview"},{id:"vendors",l:"🏪 Vendors"},{id:"prices",l:"💰 Prices"},{id:"emailimport",l:"📧 Email Import"},{id:"autosetup",l:"⚡ Auto Setup"},{id:"history",l:"🕐 History"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 14px",border:"none",background:"none",fontWeight:700,color:tab===t.id?"#111":"#999",borderBottom:tab===t.id?"3px solid #C8A84B":"3px solid transparent",whiteSpace:"nowrap"}}>
                {t.l}
              </button>
            ))}
          </div>

          <div style={{maxWidth:800,margin:"0 auto",padding:20}}>

            {/* DASHBOARD */}
            {tab==="dashboard"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:16}}>Overview</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                  {[{l:"Vendors set up",v:allV.filter(v=>v.name).length,i:"🏪"},{l:"Items in price DB",v:priceList.length,i:"💰"},{l:"Orders saved",v:history.length,i:"📦"}].map(k=>(
                    <div key={k.l} style={{background:"#fff",borderRadius:12,padding:"16px",border:"1.5px solid #E0DDD6",textAlign:"center"}}>
                      <div style={{fontSize:26,marginBottom:4}}>{k.i}</div>
                      <div style={{fontFamily:"monospace",fontWeight:800,fontSize:28}}>{k.v}</div>
                      <div style={{color:"#888",fontSize:11,marginTop:2}}>{k.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#fff",borderRadius:14,padding:20,border:"1.5px solid #E0DDD6"}}>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>Setup checklist</div>
                  {[
                    {done:allV.filter(v=>v.name&&(v.phone||v.email)).length>0,label:"Add vendors with phone/email",action:()=>setTab("vendors")},
                    {done:priceList.length>100,label:"Price database loaded ("+priceList.length+" items from your invoices)"},
                    {done:history.length>0,label:"First order placed by staff"},
                  ].map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<2?"1px solid #F4F3EF":"none"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:c.done?"#15803D":"#E0DDD6",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0}}>{c.done?"✓":i+1}</div>
                      <div style={{flex:1,color:c.done?"#888":"#111",textDecoration:c.done?"line-through":"none"}}>{c.label}</div>
                      {!c.done&&c.action&&<button onClick={c.action} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:8,padding:"5px 12px",fontWeight:700,fontSize:12}}>Do it →</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VENDORS */}
            {tab==="vendors"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Vendors</div>
                <div style={{color:"#888",marginBottom:16}}>Multiple vendors per category — cheapest auto-selected. Tap to edit.</div>
                {CATS.map(cat=>{
                  const cv=vendors[cat.id]||[];
                  return (
                    <div key={cat.id} style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontWeight:800}}>{cat.icon} {cat.label}</div>
                        <button onClick={()=>addVendor(cat.id)} style={{background:"#F4F3EF",border:"1px dashed #ccc",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#666",fontWeight:600}}>+ Add</button>
                      </div>
                      {cv.length===0&&<div style={{color:"#bbb",padding:"10px 14px",background:"#fff",borderRadius:8,border:"1px dashed #ddd"}}>No vendors yet</div>}
                      {cv.map(v=>{
                        const isEdit=editV?.cid===cat.id&&editV?.id===v.id;
                        const isBest=bestV(cat.id)?.id===v.id&&v.name;
                        const cm=CONTACT.find(c=>c.id===(v.contactMethod||"whatsapp"))||CONTACT[0];
                        const contact=v.contactMethod==="email"?v.email:v.phone;
                        return (
                          <div key={v.id} style={{background:"#fff",borderRadius:10,marginBottom:6,border:"1.5px solid "+(isBest?"#C8A84B":"#E0DDD6"),overflow:"hidden"}}>
                            {isEdit?(
                              <div style={{padding:14}}>
                                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                  <input type="text" placeholder="Vendor name"
                                    value={vDraft.name??v.name} onChange={e=>setVDraft(d=>({...d,name:e.target.value}))}
                                    style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #C8A84B",fontSize:15}}/>
                                  <div>
                                    <div style={{fontSize:12,color:"#888",marginBottom:5,fontWeight:600}}>How do they receive orders?</div>
                                    <div style={{display:"flex",gap:6}}>
                                      {CONTACT.map(c=>{const sel=(vDraft.contactMethod??v.contactMethod??"whatsapp")===c.id;return(
                                        <button key={c.id} onClick={()=>setVDraft(d=>({...d,contactMethod:c.id}))}
                                          style={{flex:1,padding:"8px 4px",borderRadius:8,border:"2px solid "+(sel?c.bg:"#ddd"),background:sel?c.bg:"#fff",color:sel?c.fg:"#888",fontWeight:700,fontSize:12}}>
                                          {c.icon} {c.label}
                                        </button>
                                      );})}
                                    </div>
                                  </div>
                                  {(vDraft.contactMethod??v.contactMethod??"whatsapp")!=="email"
                                    ?<input type="tel" placeholder="Phone (+19171234567)" value={vDraft.phone??v.phone??""} onChange={e=>setVDraft(d=>({...d,phone:e.target.value}))} style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:15}}/>
                                    :<input type="email" placeholder="Email address" value={vDraft.email??v.email??""} onChange={e=>setVDraft(d=>({...d,email:e.target.value}))} style={{padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:15}}/>
                                  }
                                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                    <input type="number" placeholder="Price per unit ($)" value={vDraft.pricePerUnit??v.pricePerUnit??0} onChange={e=>setVDraft(d=>({...d,pricePerUnit:parseFloat(e.target.value)||0}))} style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1.5px solid #ddd"}}/>
                                    <div>{["Restaurant","Catering"].map(d=>(
                                      <label key={d} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,marginBottom:4,cursor:"pointer"}}>
                                        <input type="checkbox" checked={(vDraft.dept??v.dept??[]).includes(d)} onChange={e=>{const cur=vDraft.dept??v.dept??["Restaurant","Catering"];setVDraft(dr=>({...dr,dept:e.target.checked?[...cur,d]:cur.filter(x=>x!==d)}))}}/> {d}
                                      </label>
                                    ))}</div>
                                  </div>
                                </div>
                                <div style={{display:"flex",gap:6,marginTop:10}}>
                                  <button onClick={saveVendor} style={{flex:1,background:"#C8A84B",color:"#111",border:"none",borderRadius:8,padding:10,fontWeight:800}}>Save</button>
                                  <button onClick={()=>setEditV(null)} style={{background:"#eee",border:"none",borderRadius:8,padding:"10px 14px"}}>Cancel</button>
                                  <button onClick={()=>delVendor(cat.id,v.id)} style={{background:delConf===v.id?"#DC2626":"#FEE2E2",color:delConf===v.id?"#fff":"#E74C3C",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700}}>
                                    {delConf===v.id?"Tap again to confirm":"Delete"}
                                  </button>
                                </div>
                              </div>
                            ):(
                              <button onClick={()=>{setEditV({cid:cat.id,id:v.id});setVDraft({});}} style={{width:"100%",background:"none",border:"none",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
                                <div style={{flex:1}}>
                                  <div style={{fontWeight:700,color:v.name?"#111":"#bbb"}}>{v.name||"Tap to add vendor"}</div>
                                  <div style={{fontSize:11,color:"#888",marginTop:2}}>
                                    {contact?<span style={{color:cm.bg,fontWeight:700}}>{cm.icon} {contact}</span>:<span style={{color:"#E74C3C"}}>No contact info</span>}
                                    {v.pricePerUnit>0&&<span style={{marginLeft:10}}>{usd(v.pricePerUnit)}/unit</span>}
                                    {(v.dept||[]).map(d=><span key={d} style={{marginLeft:6,background:"#F4F3EF",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>{d}</span>)}
                                  </div>
                                </div>
                                {isBest&&<span style={{background:"#FEF3C7",color:"#92400E",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>⭐ AUTO</span>}
                                <span style={{color:"#ccc",fontSize:18}}>›</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PRICES */}
            {tab==="prices"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Price Database</div>
                <div style={{color:"#888",marginBottom:12}}>{priceList.length} items · showing {filtered.length}</div>
                <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  <input type="text" placeholder="Search items or vendors..." value={pSearch} onChange={e=>{setPSearch(e.target.value);setPPage(1);}} style={{flex:1,minWidth:160,padding:"8px 12px",borderRadius:8,border:"1.5px solid #ddd"}}/>
                  <select value={pCat} onChange={e=>{setPCat(e.target.value);setPPage(1);}} style={{padding:"8px 10px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff"}}>
                    <option value="all">All Categories</option>
                    {CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <select value={pVend} onChange={e=>{setPVend(e.target.value);setPPage(1);}} style={{padding:"8px 10px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff"}}>
                    {vendorList.map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1.5px solid #E0DDD6",overflowX:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:"2fr .7fr .8fr .8fr 1.3fr .7fr",minWidth:560,background:"#111"}}>
                    {[["Item","item"],["$Price","price"],["Weight","weight"],["Pack","pack"],["Vendor","vendorName"],["Date","updatedAt"]].map(([l,c])=>(
                      <div key={c} onClick={()=>sortBy(c)} style={{padding:"10px 12px",cursor:"pointer",color:"#C8A84B",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:1,userSelect:"none"}}>
                        {l}{arr(c)}
                      </div>
                    ))}
                  </div>
                  {pageData.length===0&&<div style={{padding:32,textAlign:"center",color:"#bbb"}}>No items match</div>}
                  {pageData.map((p,i)=>{
                    const cat=CATS.find(c=>c.id===p.category);
                    return (
                      <div key={i} style={{display:"grid",gridTemplateColumns:"2fr .7fr .8fr .8fr 1.3fr .7fr",minWidth:560,borderBottom:"1px solid #F4F3EF",background:i%2===0?"#fff":"#FAFAF8"}}>
                        <div style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:7,fontWeight:600}}>
                          <span style={{flexShrink:0}}>{cat?.icon||"📦"}</span>
                          <span style={{lineHeight:1.3}}>{p.item}</span>
                        </div>
                        <div style={{padding:"9px 12px",fontFamily:"monospace",fontWeight:800,color:"#15803D",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                          <span>${Number(p.price).toFixed(2)}</span>
                          {p.prevPrice&&p.prevPrice!==p.price&&(
                            <span style={{fontSize:10,fontWeight:700,color:p.price>p.prevPrice?"#DC2626":"#15803D"}}>
                              {p.price>p.prevPrice?"▲":"▼"} from ${Number(p.prevPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div style={{padding:"9px 12px",color:p.weight?"#444":"#ccc",display:"flex",alignItems:"center"}}>{p.weight||"—"}</div>
                        <div style={{padding:"9px 12px",color:p.pack?"#444":"#ccc",display:"flex",alignItems:"center"}}>{p.pack||"—"}</div>
                        <div style={{padding:"9px 12px",display:"flex",alignItems:"center"}}>
                          <span style={{background:"#F0EDE6",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,color:"#555"}}>{p.vendorName||"—"}</span>
                        </div>
                        <div style={{padding:"9px 12px",fontSize:11,color:"#aaa",display:"flex",alignItems:"center"}}>{p.updatedAt||p.date||"—"}</div>
                      </div>
                    );
                  })}
                </div>
                {totalPg>1&&(
                  <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10,marginTop:14}}>
                    <button onClick={()=>setPPage(p=>Math.max(1,p-1))} disabled={pPage===1} style={{padding:"7px 16px",borderRadius:8,border:"1.5px solid #ddd",background:pPage===1?"#f5f5f5":"#fff",fontWeight:700,color:pPage===1?"#ccc":"#111"}}>← Prev</button>
                    <span style={{color:"#888"}}>Page {pPage} of {totalPg} · {filtered.length} items</span>
                    <button onClick={()=>setPPage(p=>Math.min(totalPg,p+1))} disabled={pPage===totalPg} style={{padding:"7px 16px",borderRadius:8,border:"1.5px solid #ddd",background:pPage===totalPg?"#f5f5f5":"#fff",fontWeight:700,color:pPage===totalPg?"#ccc":"#111"}}>Next →</button>
                  </div>
                )}
              </div>
            )}

            {/* EMAIL IMPORT */}
            {tab==="emailimport"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Import Vendor Email</div>
                <div style={{color:"#888",marginBottom:16}}>Paste any vendor price list or invoice. AI extracts every item with price, weight, and pack — then flags anything that went up suspiciously.</div>
                <textarea placeholder={"Paste vendor email here...\n\nExample:\nChicken Breast 5lb pack: $48.50\nGround Beef 10lb case: $95.00\nSalmon Fillet per lb: $12.99"}
                  value={emailTxt} onChange={e=>setEmailTxt(e.target.value)}
                  rows={9} style={{width:"100%",padding:14,borderRadius:12,border:"1.5px solid #ddd",lineHeight:1.6,resize:"vertical",marginBottom:12}}/>
                <button onClick={parseEmail} disabled={!emailTxt.trim()||emailBusy} style={{width:"100%",padding:14,borderRadius:12,border:"none",fontWeight:800,fontSize:15,background:emailTxt.trim()&&!emailBusy?"#C8A84B":"#ddd",color:emailTxt.trim()&&!emailBusy?"#111":"#999"}}>
                  {emailBusy?"⏳ Reading...":"📥 Extract prices from email"}
                </button>
                {emailRes&&(()=>{
                  const hikes=emailRes.items.filter(r=>r.change&&r.change.pct>0);
                  const drops=emailRes.items.filter(r=>r.change&&r.change.pct<0);
                  const big=hikes.filter(r=>r.change.pct>=15);
                  return (
                    <div style={{background:"#F0FDF4",border:"2px solid #86EFAC",borderRadius:12,padding:16,marginTop:16}}>
                      <div style={{fontWeight:800,fontSize:15,color:"#15803D",marginBottom:8}}>
                        {"\u2705"} {emailRes.count} prices updated
                        {big.length>0&&<span style={{marginLeft:12,color:"#DC2626",fontWeight:800}}>{"🚨"} {big.length} suspicious hike{big.length>1?"s":""} (15%+)</span>}
                      </div>
                      {big.length>0&&<div style={{background:"#FEF2F2",border:"1.5px solid #FCA5A5",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#991B1B"}}>Worth a phone call before accepting these prices.</div>}
                      <div style={{display:"grid",gridTemplateColumns:"1.6fr .9fr 1fr .8fr .8fr",gap:0,fontSize:12}}>
                        {["Item","$ Price","Change","Weight","Pack"].map(h=><div key={h} style={{padding:"6px 8px",background:"#D1FAE5",fontWeight:700,color:"#15803D"}}>{h}</div>)}
                        {emailRes.items.map((r,i)=>{
                          const ch=r.change;
                          const big2=ch&&ch.pct>=15;
                          const bg=big2?"#FEF2F2":"transparent";
                          const cc=ch?(ch.pct>0?"#DC2626":"#15803D"):"#ccc";
                          const ct=ch?((ch.pct>0?"▲ ":"▼ ")+Math.abs(ch.pct).toFixed(0)+"% (was "+usd(ch.from)+")"):"new";
                          return [
                            <div key={i+"n"} style={{padding:"5px 8px",borderBottom:"1px solid #D1FAE5",background:bg}}>{r.item}</div>,
                            <div key={i+"p"} style={{padding:"5px 8px",borderBottom:"1px solid #D1FAE5",fontFamily:"monospace",fontWeight:700,color:"#15803D",background:bg}}>${Number(r.price).toFixed(2)}</div>,
                            <div key={i+"c"} style={{padding:"5px 8px",borderBottom:"1px solid #D1FAE5",fontSize:11,fontWeight:700,background:bg,color:cc}}>{ct}</div>,
                            <div key={i+"w"} style={{padding:"5px 8px",borderBottom:"1px solid #D1FAE5",color:"#888",background:bg}}>{r.weight||"—"}</div>,
                            <div key={i+"pk"} style={{padding:"5px 8px",borderBottom:"1px solid #D1FAE5",color:"#888",background:bg}}>{r.pack||"—"}</div>,
                          ];
                        })}
                      </div>
                      {(hikes.length>0||drops.length>0)&&(
                        <div style={{marginTop:8,fontSize:12,color:"#666"}}>
                          {hikes.length>0&&<span style={{color:"#DC2626",fontWeight:700}}>▲ {hikes.length} up</span>}
                          {hikes.length>0&&drops.length>0&&<span> · </span>}
                          {drops.length>0&&<span style={{color:"#15803D",fontWeight:700}}>▼ {drops.length} down</span>}
                        </div>
                      )}
                      <button onClick={()=>setTab("prices")} style={{marginTop:10,background:"#15803D",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontWeight:700,fontSize:12}}>View price database →</button>
                    </div>
                  );
                })()}
                <div style={{background:"#EEF2FF",border:"1.5px solid #C7D2FE",borderRadius:10,padding:12,marginTop:14,fontSize:13,color:"#444"}}>
                  {"💡"} <strong>Want this automatic?</strong> See the{" "}
                  <button onClick={()=>setTab("autosetup")} style={{background:"none",border:"none",color:"#4F46E5",fontWeight:700,cursor:"pointer",fontSize:13,padding:0}}>{"⚡"} Auto Setup tab</button>
                </div>
              </div>
            )}

            {/* AUTO SETUP */}
            {tab==="autosetup"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>{"⚡"} Auto Email Setup</div>
                <div style={{color:"#888",marginBottom:20}}>One-time setup. After this, every vendor email updates prices automatically — forever.</div>
                <div style={{background:"#111",borderRadius:14,padding:20,marginBottom:20,textAlign:"center"}}>
                  <div style={{color:"#C8A84B",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>How it works</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexWrap:"wrap",rowGap:10}}>
                    {[{i:"📧",l:"Vendor\nemail"},{i:"→",plain:true},{i:"📬",l:"Your\nGmail"},{i:"→",plain:true},{i:"⚡",l:"Zapier"},{i:"→",plain:true},{i:"🏨",l:"Prices\nupdate"}].map((s,i)=>
                      s.plain?<div key={i} style={{color:"#C8A84B",fontSize:18}}>→</div>
                             :<div key={i} style={{textAlign:"center",minWidth:60}}><div style={{fontSize:24,marginBottom:3}}>{s.i}</div><div style={{color:"#aaa",fontSize:9,lineHeight:1.4,whiteSpace:"pre"}}>{s.l}</div></div>
                    )}
                  </div>
                </div>
                {[
                  {n:"1",t:"Create a free Zapier account",b:"Go to zapier.com, sign up free. Free plan handles 100 emails/month.",url:"https://zapier.com/sign-up",bl:"Open Zapier",c:"#2563EB"},
                  {n:"2",t:"New Zap: Gmail to Webhook",b:"Create Zap. Trigger: Gmail New Email. Connect your hotel email. Filter to vendor addresses only.",c:"#7C3AED"},
                  {n:"3",t:"Action: Webhooks by Zapier POST",b:"URL: https://your-server.com/api/email-ingest\nBody fields: text = email body, subject = subject, from = sender email, key = your hotel key below.",c:"#0F766E"},
                  {n:"4",t:"Your unique hotel key — copy this",b:"Paste this into the webhook body as the 'key' field:",key:wkey,c:"#C8A84B"},
                  {n:"5",t:"Test it",b:"Click Test Zap in Zapier. Within 30 seconds, new prices will appear in your Prices tab.",c:"#15803D"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#fff",borderRadius:12,marginBottom:10,overflow:"hidden",border:"1.5px solid #E0DDD6"}}>
                    <div style={{background:s.c,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,.25)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0}}>{s.n}</div>
                      <div style={{color:"#fff",fontWeight:800}}>{s.t}</div>
                    </div>
                    <div style={{padding:"12px 16px"}}>
                      <div style={{color:"#444",lineHeight:1.7,whiteSpace:"pre-line"}}>{s.b}</div>
                      {s.key&&<div style={{marginTop:8,background:"#F4F3EF",borderRadius:8,padding:"10px 14px",fontFamily:"monospace",fontWeight:700,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>{s.key}</span>
                        <button onClick={()=>{navigator.clipboard?.writeText(s.key);toast_("Key copied!");}} style={{background:"#C8A84B",color:"#111",border:"none",borderRadius:6,padding:"4px 12px",fontWeight:700,fontSize:12}}>Copy</button>
                      </div>}
                      {s.url&&<a href={s.url} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:10,background:s.c,color:"#fff",borderRadius:8,padding:"7px 14px",fontWeight:700,textDecoration:"none"}}>{s.bl} →</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* HISTORY */}
            {tab==="history"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Order History</div>
                <div style={{color:"#888",marginBottom:16}}>{history.length} orders</div>
                {history.length===0&&<div style={{textAlign:"center",padding:50,color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>🕐</div><div style={{fontWeight:600}}>No orders yet</div></div>}
                {history.map(h=>(
                  <details key={h.id} style={{background:"#fff",borderRadius:12,marginBottom:8,border:"1.5px solid #E0DDD6",overflow:"hidden"}}>
                    <summary style={{padding:"12px 16px",cursor:"pointer",listStyle:"none",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700}}>{h.date} — {h.dept}</div>
                        <div style={{fontSize:12,color:"#888"}}>{(h.items||[]).length} items</div>
                      </div>
                      <span style={{color:"#bbb",fontSize:18}}>›</span>
                    </summary>
                    <div style={{padding:"0 16px 12px",borderTop:"1px solid #F4F3EF"}}>
                      {(h.items||[]).map((it,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid #F4F3EF"}}>
                          <span>{CATS.find(c=>c.id===it.catId)?.icon} {it.name}</span>
                          <span style={{fontFamily:"monospace",fontWeight:600}}>{it.qty} {it.unit}{it.price>0?" · "+usd(it.price):""}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{background:"#111",color:"#888",padding:"24px 20px",marginTop:30,lineHeight:1.7}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{color:"#C8A84B",fontWeight:800,fontSize:13,marginBottom:8,letterSpacing:1}}>{"✡"} SLEEPY HOLLOW HOTEL — FOOD ORDERING {"&"} PRICE-TRACKING SYSTEM</div>
          <p style={{marginBottom:8}}>Staff: tap the camera button, photograph any order list (handwritten or printed), check the items, and tap Send. Each vendor gets their order via WhatsApp, SMS, or email automatically.</p>
          <p style={{marginBottom:8}}>Managers: the price database is seeded from 6 months of real invoices — this is a baseline, not a limit. Staff can order any new item; it just gets added. Every time a vendor emails a price list, paste it in Email Import and the system updates automatically, flagging anything that jumped more than 15%.</p>
          <p>The goal: order smarter, track every price movement, and instantly see who is raising prices unfairly versus legitimate cost changes.</p>
        </div>
      </div>
    </div>
  );
}
