import fs from "fs";

const files = ["tmp-filter-raw.txt", "tmp-results-raw.txt", "tmp-market-raw.txt"];
const skip = new Set(
  `className div span button section h2 h3 h4 p label input form true false null undefined
  const let var return if else map filter find some every includes length key type name value
  children class flex items justify gap text dark sm lg md xl px py pt pb pl pr mx my mt mb
  w h min max border bg rounded font bold black white slate coral emerald sky rose amber
  indigo teal purple transition hover focus active absolute relative sticky overflow hidden
  full auto none center start end left right top bottom size icon variant ghost outline
  default onClick onChange onKeyDown onFocus onBlur onSubmit onOpenChange open disabled title
  aria placeholder ref style id htmlFor role switch checked selected initial animate exit
  layout whileHover whileTap mode wait popLayout presence AnimatePresence motion Suspense
  Skeleton Table TableHeader TableBody TableRow TableHead TableCell Button Input Select
  SelectContent SelectItem SelectTrigger SelectValue Dialog DialogContent DialogHeader
  DialogTitle Badge Fragment React Math Number String Array Object Date JSON parseInt
  parseFloat isNaN isFinite toLocaleString toFixed toString slice join split replace trim
  push forEach sort reverse keys values entries from Boolean console window document
  localStorage setTimeout clearTimeout encodeURIComponent fetch Promise async await try
  catch throw new typeof instanceof of in this as any unknown never void function
  constructor get set super extends implements interface export import default`.split(/\s+/)
);

const ids = new Set();
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
    const w = m[1];
    if (skip.has(w)) continue;
    if (w.length <= 1) continue;
    ids.add(w);
  }
}
console.log([...ids].sort().join("\n"));
console.log("--- count", ids.size);
