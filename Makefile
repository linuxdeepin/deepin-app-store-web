PREFIX=/usr

all: build
run:
	yarn start
build:
	mv node_modules node_modules.bk || true
	ln -s vendor-deps/node_modules node_modules
	PATH=./node_modules/.bin:${PATH} ng build --prod

install:
	mkdir -pv ${DESTDIR}${PREFIX}/share/deepin-app-store/web_dist
	cp -r dist/deepin-app-store-web/* \
		  ${DESTDIR}${PREFIX}/share/deepin-app-store/web_dist