/* eslint react-native/no-color-literals:0 */
import React, { Component } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	PanResponder,
	TouchableHighlight,
	StyleSheet,
	View,
 	Text } from 'react-native'

const ANIMATION_DURATION = 300
const IGNORE_PULL_PIXELS = 15
const DISMISS_TO_HEIGHT_RATIO = 0.25
const SCREEN_HEIGHT = Dimensions.get('window').height
const MAX_OPACITY = 0.8

const styles = StyleSheet.create({
	container: { flexGrow: 1 },

	overlay: {
		flexGrow: 1,
		backgroundColor: 'rgb(0,0,0)',
	},

	content: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom:0,
		top: 0,
		justifyContent: 'center', alignItems: 'center',
	},

	cross: {
		position: 'absolute',
		left: 4,
		top: 20,
	},

	crossText: {
		color: 'white',
		fontSize: 18,
		padding: 10,
	}
})

class SwipeableOverlay extends Component {
	constructor (props) {
		super(props)
		this.state = {
			show: false,
			opacity: new Animated.Value(0),
			scale: new Animated.Value(1),
			position: new Animated.Value(SCREEN_HEIGHT * 2),
			showCross: true,
		}
		this.hide = this.hide.bind(this)
		this.initPanResponder = this.initPanResponder.bind(this)
		this.onMoveShouldSetPanResponder = this.onMoveShouldSetPanResponder.bind(this)
		this.onPanResponderMove = this.onPanResponderMove.bind(this)
		this.onPanResponderRelease = this.onPanResponderRelease.bind(this)
		this.onPanResponderTerminate = this.onPanResponderTerminate.bind(this)
		this.trueFunction = () => true
		this.falseFunction = () => false
	}

	componentWillMount () {
		this.initPanResponder()
	}

	componentDidMount () {
		this.isComponentMounted = true
	}

	componentWillUnmount () {
		this.isComponentMounted = false
	}

	initPanResponder () {
		const config = {
			onStartShouldSetPanResponder: this.trueFunction,
			onStartShouldSetPanResponderCapture: this.falseFunction,
			onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
			onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponder,
			onPanResponderMove: this.onPanResponderMove,
			onPanResponderTerminationRequest: this.trueFunction,
			onPanResponderRelease: this.onPanResponderRelease,
			onPanResponderTerminate: this.onPanResponderTerminate,
			onShouldBlockNativeResponder: this.trueFunction,
		}
		this.panResponder = PanResponder.create(config)
	}

	onMoveShouldSetPanResponder (e, state) {
		return state.dy > IGNORE_PULL_PIXELS
	}

	onPanResponderMove (e, state) {
		if (state.dy < IGNORE_PULL_PIXELS)
			return
		const ratio = state.dy / SCREEN_HEIGHT
		this.state.opacity.setValue((1 - ratio) * (this.props.overlayOpacity || MAX_OPACITY))
		if (ratio > 0)
			return Animated.timing(
				this.state.position,
				{
					toValue: state.dy,
					duration: ANIMATION_DURATION * (ratio - this.state.position._value),
				},
			).start()
	}

	onPanResponderRelease (e, state) {
		const ratio = state.dy / SCREEN_HEIGHT
		if (ratio < DISMISS_TO_HEIGHT_RATIO)
			return Animated.timing(
				this.state.position,
				{
					toValue: 0,
					duration: ANIMATION_DURATION * ratio,
				},
			).start()
		else
			this.hide()
	}

	onPanResponderTerminate () {
		Animated.timing(
			this.state.position,
			{
				toValue: 0,
				duration: ANIMATION_DURATION * this.state.position._value,
			},
		).start()
	}

	hide () {
		if (!this.isComponentMounted)
			return
		this.setState({ showCross: false })
		const opacityAnimation = Animated.timing(
			this.state.opacity,
			{
				toValue: 0,
				duration: ANIMATION_DURATION,
				useNativeDriver: true,
			},
		)
		const positionAnimation = Animated.timing(
			this.state.position,
			{
				toValue: SCREEN_HEIGHT * 2,
				duration: ANIMATION_DURATION,
			},
		)
		Animated.sequence([ positionAnimation, opacityAnimation ]).start(() => {
			this.setState({
				show: false,
			},
			() => this.props.onClose && this.props.onClose())
		})
	}

	show (data) {
		if (!this.isComponentMounted)
			return
		this.setState({ data, show: true, showCross: true }, () => this.props.onShow && this.props.onShow())
		const positionAnimation = Animated.timing(
			this.state.position,
			{
				toValue: 0,
				duration: ANIMATION_DURATION,
			},
		)
		const opacityAnimation = Animated.timing(
			this.state.opacity,
			{
				toValue: this.props.overlayOpacity || MAX_OPACITY,
				duration: ANIMATION_DURATION,
				useNativeDriver: true,
			},
		)
		Animated.sequence([ opacityAnimation, positionAnimation ]).start()
	}

	render () {
		const containerStyle = { opacity: this.state.opacity, flexGrow: 1 }
		const transformStyle = { transform: [ { scale: this.state.scale } ], top: this.state.position }
		return (
			<Modal
				transparent
				visible={ this.state.show }
				onShow={ this.props.onShow }
				onRequestClose={ this.hide }
			>
				<View { ...this.panResponder.panHandlers } style={ styles.container }>
					<Animated.View style={ containerStyle }>
						<TouchableHighlight
							style={ styles.overlay }
							onPress={ this.hide }
						>
							<View />
						</TouchableHighlight>
					</Animated.View>
					<Animated.View style={ [ styles.content, transformStyle ] }>
						{  this.props.children }
					</Animated.View>
					{ this.state.showCross ?
						(<TouchableHighlight
							style={ styles.cross }
							underlayColor={ 'transparent' }
							onPress={ this.hide }
						>
							<Text style={ styles.crossText }>X</Text>
						</TouchableHighlight>) : null
					}
				</View>
			</Modal>
		)
	}
}

export default SwipeableOverlay
