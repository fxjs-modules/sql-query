declare namespace FxSqlQuery {
	type AggregationFunction = Function

	interface SupportedAggregationsMixin {
		abs: Function
		ceil: Function
		floor: Function
		round: Function
		avg: Function
		min: Function
		max: Function
		log: Function
		log2: Function
		log10: Function
		exp: Function
		power: Function
		acos: Function
		asin: Function
		atan: Function
		cos: Function
		sin: Function
		tan: Function
		conv: Function
		random: Function
		rand: Function
		radians: Function
		degrees: Function
		sum: Function
		count: Function
		distinct: Function
	}

	type SupportedAggregationFunction = keyof SupportedAggregationsMixin
}
