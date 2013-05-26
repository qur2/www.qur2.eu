jsondata:
	node serve robot

site:
	node site

css:
	lessc public/assets/less/site.less public/assets/css/site.css

publish:
	cd qur2.eu && git add -u && \
		git commit --amend --no-edit --author "Aurélien Scoubeau <aurelien.scoubeau@gmail.com>" && \
		git push github +master

.PHONY: site css publish jsondata
