```relation-forge
FIND ALLIES
	SOURCE "[[Marcus Veren]]"
	TARGET "[[Lord Farron]]"
	OPTIONS
		max: 10
		sort: desc
```

```relation-forge
FIND UNSTABLE TRIADS
	OPTIONS
		max: 5
		sort: desc
```

```relation-forge
COMPLETE TRIAD
	CHAR1 "[[Marcus Veren]]"
	CHAR2 "[[Lord Farron]]"
	OPTIONS
		max: 5
		sort: desc
		allowBidirectional: true
```

```relation-forge
FIND INFLUENCE PATHS
	SOURCE "[[Marcus Veren]]"
	TARGET "[[Lord Farron]]"
	OPTIONS
		max: 10
		sort: desc
		minRelationInfluence: 0
		includeNegativePaths: true
		maxPathLength: 5
		influenceModel: weakestLink
```