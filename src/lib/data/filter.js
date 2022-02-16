import fs from 'fs'

function filterData(filename) {
	const data = JSON.parse(fs.readFileSync(`./${filename}.json`, 'utf8'))
	fs.writeFileSync(
		`./${filename}-filtered.json`,
		JSON.stringify(data.filter((word) => word.length === 5 && /^[a-z]{5}$/i.test(word)))
	)
}

filterData('targets')
filterData('dictionary')
