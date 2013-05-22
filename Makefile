site:
	node site

css:
	lessc public/assets/less/site.less public/assets/css/site.css

publish:
	cd qur2.eu && git push github +master

.PHONY: site css publish
