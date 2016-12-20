# Maintainer: Eric Chu <eric@ericchu.net>
pkgname=flags-git
pkgver=v3.1.0.r0.e1e5f3b
pkgrel=1
pkgdesc='a Flags server daemon'
arch=('any')
url='https://github.com/ericchu94/flags'
license=('GPL')
depends=('nodejs'
         'npm')
provides=("${pkgname%-git}")
conflicts=("${pkgname%-git}")
source=('git://github.com/ericchu94/flags.git')
md5sums=('SKIP')
install="${pkgname%-git}.install"

pkgver() {
  cd "$srcdir/${pkgname%-git}"
  printf "%s" "$(git describe --long --tags | sed 's/\([^-]*-\)g/r\1/;s/-/./g')"
}

package() {
  cd "$srcdir/${pkgname%-git}"

  mkdir -p "$pkgdir/opt/${pkgname%-git}"
  cp *.js "$pkgdir/opt/${pkgname%-git}"
  cp *.json "$pkgdir/opt/${pkgname%-git}"
  cp -r assets "$pkgdir/opt/${pkgname%-git}"
  cp -r views "$pkgdir/opt/${pkgname%-git}"

  mkdir -p "$pkgdir/usr/bin"
  ln -s "/opt/${pkgname%-git}/index.js" "$pkgdir/usr/bin/flags"

  mkdir -p "$pkgdir/usr/lib/systemd/system"
  cp flags.service "$pkgdir/usr/lib/systemd/system"
}
