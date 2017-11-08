;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.State = factory()
}(this, (function () { 'use strict'

class State {
	// (S => (A, S)) => Unit
	constructor(runCallback) {
		assert(isFunction(runCallback), 'constructor runCallback must be a function')
		this.run = runCallback
	}

	// (A => State[S, B]) => State[S, B]
	flatMap(f) {
		return new State(s => {
			const [a, s1] = this.run(s)
			return f(a).run(s1)
		})
	}

	// (A => B) => State[S, B]
	map(f) {
		return this.flatMap(a => State.unit(f(a)))
	}
}

// A => State[S, A]
State.unit = a => new State(s => [a, s])

// List[State[S, A]] => State[S, List[A]]
State.sequence = sas => {
	// (S, List[State[S, A]], List[A]) => [List[A], S]
	function go(s, actions, acc) {
		if (actions.length === 0) return [acc.reverse(), s]
		const [h, ...t] = actions
		const [a, s2] = h.run(s)
		return go(s2, t, [a, ...acc])
	}
	return new State(s => go(s, sas, []))
}

// (S => S) => State[S, Unit]
State.modify = f => {
	return State.get().flatMap(s => State.set(f(s)))
}

// () => State[S, S]
State.get = () => {
	return new State(s => [s, s])
}

// S => State[S, Unit]
State.set = s => {
	return new State(_ => [undefined, s])
}

function isFunction(fn) {
	return typeof fn === 'function'
}

function assert(value, message = '') {
	if (!value) throw new Error(message)
}

return State

})))