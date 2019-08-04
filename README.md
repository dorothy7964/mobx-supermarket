# MobX

리액트 상태 관리 라이브러리  
"MobX 는 최소한의 공수로 여러분들의 상태관리 시스템을 설계 할 수 있게 해줍니다."  

<br>

# MobX 의 주요 개념들

1. Observable State (관찰 받고 있는 상태)

    MobX 에서는 정확히 **어떤 부분이 바뀌었는지** 알 수 있습니다.   
    그 값이, 원시적인 값이던, 객체이던, 배열 내부의 객체이던 객체의 키이던 간에 말이죠.  

2. Computed Value (연산된 값)

    기존의 상태값과 다른 연산된 값에 기반하여 만들어질 수 있는 값입니다.  
    주로 **성능 최적화**를 위하여 많이 사용됩니다.  

3. Reactions (반응)

    Reactions 는 Computed Value 와 비슷한데,    
    **Computed Value 의 경우는 우리가 특정 값을 연산해야 될 때 에만 처리**가 되는 반면에,  
    **Reactions 은, 값이 바뀜에 따라 해야 할 일을 정하는 것**을 의미합니다.   

4. Actions (액션; 행동)

    액션은, **상태에 변화를 일으키는것**을 말합니다.  
    만약에 Observable State 에 변화를 일으키는 코드를 호출한다? 이것은 하나의 액션입니다.   
    리덕스에서의 액션과 달리 따로 객체형태로 만들지는 않습니다.

<br>

# MobX 라이브러리 설치

```JavaScript
yarn add mobx mobx-react
```

## mobx

**`decorate`**    decorate 를 통해서 각 값에 MobX 함수 적용  
**`observable`**  관찰 받고 있는 상태  
**`action`**  액션; 행동  


## mobx-react

**`observer`**    observer 가 observable 값이 변할 때 컴포넌트의 forceUpdate 를 호출하게 함으로써 자동으로 변화가 화면에 반영  
**`inject`**  mobx-react 에 있는 함수로서, 컴포넌트에서 스토어에 접근할 수 있게 해줍니다.   
**`Provider`**    MobX에서 프로젝트에 스토어를 적용 할 때는, Redux 처럼 Provider 라는 컴포넌트를 사용  


우리가 만약에 create-react-app 으로 프로젝트를 만들면 기본적으로는 decorator 를 사용하지 못하기 때문에 따로 babel 설정을 해줘야 합니다.

<br/>

# Decorator 와 함께 사용하기

decorator 를 사용하면 훨씬 더 편하게 문법을 작성 할 수 있는데요,  
그러려면 babel 설정을 해주셔야 합니다. babel 설정을 커스터마이징 하려면 yarn eject 를 해야합니다.

[Create-react-app V2 릴리즈!](https://velog.io/@velopert/create-react-app-v2)
[create-react-app 에서 eject 명령으로 설정 파일 추출](https://blog.grotesq.com/post/691)

```javascript
yarn eject
```

```javascript
yarn add @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators
```

그리고 나서, package.json 을 열으신 다음에, babel 쪽을 찾아서 다음과 같이 수정해주세요.

```javascript
"babel": {
  "presets": [
    "react-app"
  ],
  "plugins": [
      ["@babel/plugin-proposal-decorators", { "legacy": true}],
      ["@babel/plugin-proposal-class-properties", { "loose": true}]
  ]
}
```
### **src/Counter.js**

```javascript
import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

// **** 최하단에 잇던 observer 가 이렇게 위로 올라옵니다.
@observer
class Counter extends Component {
  @observable number = 0;

  @action
  increase = () => {
    this.number++;
  }

  @action
  decrease = () => {
    this.number--;
  }

  render() {
    return (
      <div>
        <h1>{this.number}</h1>
        <button onClick={this.increase}>+1</button>
        <button onClick={this.decrease}>-1</button>
      </div>
    );
  }
}


// **** decorate 는 더 이상 필요 없어집니다.
// decorate(Counter, {
//   number: observable,
//   increase: action,
//   decrease: action
// })

// export default observer(Counter);
// **** observer 는 코드의 상단으로 올라갑니다.
export default Counter;
```
우선 우리가 이 튜토리얼의 상단부에서 다뤘던것처럼 decorator 사용은 필수는 아니라는 점

<br/>

# MobX 스토어 분리시키기

MobX 에도 리덕스처럼 스토어라는 개념이 있습니다.   
리덕스는 하나의 앱에는 단 하나의 스토어만 있지만, MobX 에서는 여러개를 만들어도 됩니다.  

## 스토어 만들기

MobX 에서 스토어를 만드는건 생각보다 간단합니다.   
리덕스처럼 리듀서나, 액션 생성함수.. 그런건 없습니다. 그냥 하나의 클래스에 observable 값이랑 함수들을 만들어주면 끝!  

### **stores/counter.js**

```javascript
import { observable, action } from 'mobx';

export default class CounterStore {
  @observable number = 0;

  @action increase = () => {
    this.number++;
  }

  @action decrease = () => {
    this.number--;
  }
}
```

## Provider 로 프로젝트에 스토어 적용

MobX에서 프로젝트에 스토어를 적용 할 때는, Redux 처럼 Provider 라는 컴포넌트를 사용합니다.  

### **src/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react'; // MobX 에서 사용하는 Provider
import App from './App';
import CounterStore from './stores/counter'; // 방금 만든 스토어 불러와줍니다.

const counter = new CounterStore(); // 스토어 인스턴스를 만들고

ReactDOM.render(
  <Provider counter={counter}>
    {/* Provider 에 props 로 넣어줍니다. */}
    <App />
  </Provider>,
  document.getElementById('root')
);
```

## inject 로 컴포넌트에 스토어 주입

inject 함수는 mobx-react 에 있는 함수로서, 컴포넌트에서 스토어에 접근할 수 있게 해줍니다. 정확히는, 스토어에 있는 값을 컴포넌트의 props 로 "주입"을 해줍니다.

### **stores/Counter.js**

```javascript
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

@inject('counter')
@observer
class Counter extends Component {
  render() {
    const { counter } = this.props;
    return (
      <div>
        <h1>{counter.number}</h1>
        <button onClick={counter.increase}>+1</button>
        <button onClick={counter.decrease}>-1</button>
      </div>
    );
  }
}

export default Counter;
```

위와 같이 inject('스토어이름') 을 하시면 컴포넌트에서 해당 스토어를 props 로 전달받아서 사용 할 수 있게 됩니다.

<br/>

# 스토어의 특정 값이나 함수만 넣어주고 싶다면

마치 리덕스에서의 mapStateToProps / mapDispatchToProps 처럼 스토어의 특정 값이나 함수만 넣어주고 싶다면 이렇게 하실 수도 있습니다.

### **src/Counter.js**

```javascript
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

// **** 함수형태로 파라미터를 전달해주면 특정 값만 받아올 수 있음.
@inject(stores => ({
  number: stores.counter.number,
  increase: stores.counter.increase,
  decrease: stores.counter.decrease,
}))
@observer
class Counter extends Component {
  render() {
    const { number, increase, decrease } = this.props;
    return (
      <div>
        <h1>{number}</h1>
        <button onClick={increase}>+1</button>
        <button onClick={decrease}>-1</button>
      </div>
    );
  }
}

export default Counter;
```

이제 컴포넌트는, 유저 인터페이스와, 인터랙션만 관리하면 되고 상태 관련 로직은 모두 스토어로 분리되었습니다.

리덕스에서는, 우리가 프리젠테이셔널 컴포넌트 / 컨테이너 컴포넌트 라는 개념에 대해서 알아보았었습니다. 단순히 props 값을 가져오기만 해서 받아오는 컴포넌트는 프리젠테이셔널 컴포넌트라고 부르고, 스토어에서 부터 값이나 액션 생성함수를 받아오는 컴포넌트를 컨테이너 컴포넌트라고 부른다고 했었죠.

리덕스 진영에서는, 문서에서도 그렇고 생태계 쪽에서도 그렇고 프리젠테이셔널 / 컨테이너로 분리해서 작성하는게 일반적입니다. 반면, MobX 에서는, 딱히 그런걸 명시하지 않습니다. 그래서, 굳이 번거롭게 컨테이너를 강제적으로 만드실 필요는 없습니다. 하지만, 하셔도 무방합니다!

<br/>
