# react-native-swipeable-overlay
A swipeable overlay component for react native.
A flexible swipeable overlay component for React native with callbacks and adjustable overlay opacity!

# Demo
![rn-halfcard Demo](https://github.com/chethann/demo-images/blob/master/slideable-overlay-android.gif)

# Usage

```javascript
<SwipeableOverlay
	ref={ ref => this.overlay = ref }
	onClose={ this.onClose }
	onShow={ () => console.log(‘shown’) }
	overlayOpacity={0.5}
>
	<View  style={{height: 400, width: 400, backgroundColor: 'pink' }}/>
</SwipeableOverlay>
```

Any valid React Native View can be passed as content of the SwipeableOverlay. The content is adjusted to the center of the viewport. To open the halfcard call ```this.overlay.show() ``` method and to programatically close call ```this.overlay.hide() ``` method. ```overlay``` is the reference to the overlay.

To show use something like ``` <Text onPress={ () => { this.overlay.show() } }>Show</Text> ```  

### Installation
- `npm install --save react-native-swipeable-overlay`

License
----
MIT
