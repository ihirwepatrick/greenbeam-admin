$root = "d:\Projects\Papa_Ronia\greenbeam-ecommerce"
$src = "$root\app\admin"
$dst = "$root\admin-dashboard\app"

$maps = @(
    @{ src = "products\page.tsx"; dst = "products\page.tsx" },
    @{ src = "products\new\page.tsx"; dst = "products\new\page.tsx" },
    @{ src = "products\loading.tsx"; dst = "products\loading.tsx" },
    @{ src = "enquiries\page.tsx"; dst = "enquiries\page.tsx" },
    @{ src = "website\page.tsx"; dst = "website\page.tsx" },
    @{ src = "settings\page.tsx"; dst = "settings\page.tsx" },
    @{ src = "carts\page.tsx"; dst = "carts\page.tsx" },
    @{ src = "orders\page.tsx"; dst = "orders\page.tsx" },
    @{ src = "orders\loading.tsx"; dst = "orders\loading.tsx" },
    @{ src = "payments\page.tsx"; dst = "payments\page.tsx" }
)

foreach ($m in $maps) {
    $srcPath = Join-Path $src $m.src
    $dstPath = Join-Path $dst $m.dst
    $dir = Split-Path $dstPath -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    if (Test-Path $srcPath) {
        $c = Get-Content $srcPath -Raw
        $c = $c -replace 'from "../../components/', 'from "@/components/'
        $c = $c -replace 'from "../../../contexts/', 'from "@/contexts/'
        $c = $c -replace 'from "../../../hooks/', 'from "@/hooks/'
        $c = $c -replace 'from "../../../lib/', 'from "@/lib/'
        $c = $c -replace 'from "@/lib/services/api"', 'from "@/lib/services/api"'
        $c = $c -replace 'href="/admin"', 'href="/"'
        $c = $c -replace 'href="/admin/products"', 'href="/products"'
        $c = $c -replace 'href="/admin/enquiries"', 'href="/enquiries"'
        $c = $c -replace 'href="/admin/website"', 'href="/website"'
        $c = $c -replace 'href="/admin/settings"', 'href="/settings"'
        $c = $c -replace "href='/admin/carts'", "href='/carts'"
        $c = $c -replace "href='/admin/orders'", "href='/orders'"
        $c = $c -replace "href='/admin/payments'", "href='/payments'"
        $c = $c -replace 'link\.href === "/admin"', 'link.href === "/"'
        $c = $c -replace 'link\.href === "/admin/products"', 'link.href === "/products"'
        $c = $c -replace 'link\.href === "/admin/enquiries"', 'link.href === "/enquiries"'
        $c = $c -replace 'link\.href === "/admin/website"', 'link.href === "/website"'
        $c = $c -replace 'link\.href === "/admin/settings"', 'link.href === "/settings"'
        $c = $c -replace 'link\.href === "/admin/carts"', 'link.href === "/carts"'
        $c = $c -replace 'link\.href === "/admin/orders"', 'link.href === "/orders"'
        $c = $c -replace 'link\.href === "/admin/payments"', 'link.href === "/payments"'
        $c = $c -replace '"/admin/products/new"', '"/products/new"'
        $c = $c -replace '"/admin/enquiries"', '"/enquiries"'
        $c = $c -replace '"/admin/settings"', '"/settings"'
        $c = $c -replace '"/admin/products"', '"/products"'
        $c = $c -replace 'location\.href = "/admin/products"', 'location.href = "/products"'
        Set-Content -Path $dstPath -Value $c -NoNewline
    }
}
