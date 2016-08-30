
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync eRx-build
	tnpm sync eRx-build

