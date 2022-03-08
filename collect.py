import json
import requests
import random

# Ce script permet de récolter au moins 100 faits de la forme [start|relation|end] où
# start et end sont des concepts de ConceptNet et relation est une relation particulière.
#
# EX : http://api.conceptnet.io/query?rel=/r/UsedFor&limit=1000

relations = ["/r/RelatedTo", "/r/FormOf", "/r/IsA", "/r/PartOf", "/r/HasA", "/r/UsedFor", "/r/CapableOf", "/r/AtLocation", "/r/Causes", "/r/HasSubevent", "/r/HasFirstSubevent", "/r/HasLastSubevent", "/r/HasPrerequisite", "/r/HasProperty", "/r/MotivatedByGoal", "/r/ObstructedBy", "/r/Desires", "/r/CreatedBy", "/r/Synonym", "/r/Antonym", "/r/DistinctFrom", "/r/DerivedFrom", "/r/SymbolOf", "/r/DefinedAs", "/r/MannerOf", "/r/LocatedNear", "/r/HasContext", "/r/SimilarTo", "/r/EtymologicallyRelatedTo", "/r/EtymologicallyDerivedFrom", "/r/MadeOf", "/r/ReceivesAction"]

json_dict = {"result": ""}
objs = []
while len(objs) < 100:
	rel = relations[random.randint(0, len(relations) - 1)]
	lg = '/c/en' if random.choice([True, False]) else '/c/fr'

	obj = requests.get(f"https://api.conceptnet.io/query?rel={rel}&other={lg}&limit=1000").json()

	if len(obj['edges']) < 1 :
		continue

	index = random.randint(0, len(obj['edges']) - 1)

	# Get the relation
	start = obj['edges'][index]['start']
	relation = obj['edges'][index]['rel']
	end = obj['edges'][index]['end']

	# Check if language is french or english
	if start['language'] == end['language'] :
		info = {"start": {"@id": start['@id'], "label": start['label']}, "rel": {"@id": relation['@id'], "label": relation['label']}, "end": {"@id": end['@id'], "label": end['label']}}

		objs.append(info)

# Get multiple end nodes from specific start-relation concept & node in multiple concepts.
while len(objs) < 10: # TODO.. change this to 110
	rel = relations[random.randint(0, len(relations) - 1)]
	lg = '/c/en' if random.choice([True, False]) else '/c/fr'

	obj = requests.get(f"https://api.conceptnet.io/query?rel={rel}&other={lg}&limit=1000").json()

	if len(obj['edges']) < 1 :
		continue

	index = random.randint(0, len(obj['edges']) - 1)
	obj = requests.get(f"https://api.conceptnet.io/query?node={obj['edges'][index]['start']['@id']}&other={lg}&limit=1000").json()

	if len(obj['edges']) < 2 :
		continue

	# Get the first 5 concepts [node w/multiple relations]
	for i in range(0, 5):
		index = random.randint(0, len(obj['edges']) - 1)

		# Get the relation
		start = obj['edges'][index]['start']
		relation = obj['edges'][index]['rel']
		end = obj['edges'][index]['end']

		print(start['language'])
		print(end['language'])

		# Check if language is french or english
		if start['language'] == end['language'] :
			info = {"start": {"@id": start['@id'], "label": start['label']}, "rel": {"@id": relation['@id'], "label": relation['label']}, "end": {"@id": end['@id'], "label": end['label']}}

			objs.append(info)

# Get multiple end nodes from specific start-relation concept & node in multiple concepts.
while len(objs) < 120:
	print(len(objs))

	rel = relations[random.randint(0, len(relations) - 1)]
	lg = '/c/en' if random.choice([True, False]) else '/c/fr'

	obj = requests.get(f"https://api.conceptnet.io/query?rel={rel}&other={lg}&limit=1000").json()

	if len(obj['edges']) < 1 :
		continue

	index = random.randint(0, len(obj['edges']) - 1)
	obj = requests.get(f"https://api.conceptnet.io/query?rel={rel}&start={obj['edges'][index]['start']['@id']}&other={lg}&limit=1000").json()

	if len(obj['edges']) < 2 :
		continue

	# Get the first 5 concepts [start/rel]
	for i in range(0, 5):
		index = random.randint(0, len(obj['edges']) - 1)

		# Get the relation
		start = obj['edges'][index]['start']
		relation = obj['edges'][index]['rel']
		end = obj['edges'][index]['end']

		# Check if language is french or english
		if start['language'] == end['language'] :
			info = {"start": {"@id": start['@id'], "label": start['label']}, "rel": {"@id": relation['@id'], "label": relation['label']}, "end": {"@id": end['@id'], "label": end['label']}}

			objs.append(info)


json_dict["result"] = objs

# Write JSON file.
json_obj = json.dumps(json_dict)
with open("result.json", 'w') as f:
    f.write(json_obj)

