# Counter는 이전 그대로 유지

[이전 설명](https://github.com/dorothy7964/mobx-with-react)

<br/>

# market 스토어 작성하기

**src/stores/market.js**

```javascript
import { observable, action, computed } from 'mobx';

export default class MarketStore {
  @observable selectedItems = [];

  @action
  put = (name, price) => {
    // 존재하는지 찾고
    const exists = this.selectedItems.find(item => item.name === name);
    if (!exists) {
      // 존재하지 않는다면 새로 집어넣습니다.
      this.selectedItems.push({
        name,
        price,
        count: 1,
      });
      return;
    }
    // 존재 한다면 count 값만 올립니다.
    exists.count++;
  };

  @action
  take = name => {
    const itemToTake = this.selectedItems.find(item => item.name === name);
    itemToTake.count--;
    if (itemToTake.count === 0) {
      // 갯수가 0 이면
      this.selectedItems.remove(itemToTake); // 배열에서 제거처리합니다.
    }
  };

  @computed
  get total() {
    console.log('총합 계산...');
    return this.selectedItems.reduce((previous, current) => {
      return previous + current.price * current.count;
    }, 0);
  }
}
```

<br/>

# market 스토어 적용하기

방금 만든 스토어를 index.js 에서 Provider 에 넣어주세요.

**src/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import CounterStore from './stores/counter';
import MarketStore from './stores/market';

const counter = new CounterStore();
const market = new MarketStore();


ReactDOM.render(
  <Provider counter={counter} market={market}>
    <App />
  </Provider>, document.getElementById('root'));
```

<br/>

# 기능 구현하기 - 아이템 추가

아이템을 추가하는 기능부터 구현하겠습니다!

**src/components/ShopItemList.js**

```javascript
import React from 'react';
import ShopItem from './ShopItem';
import { inject, observer } from 'mobx-react'; // 불러오기

const items = [
  {
    name: '생수',
    price: 850,
  },
  {
    name: '신라면',
    price: 900,
  },
  {
    name: '포카칩',
    price: 1500,
  },
  {
    name: '새우깡',
    price: 1000,
  },
];

// **** onPut 함수 추가됨
const ShopItemList = ({ onPut }) => {
  const itemList = items.map(item => (
    <ShopItem {...item} key={item.name} onPut={onPut} />
  ));
  return <div>{itemList}</div>;
};

// **** inject, observer 적용
export default inject(({ market }) => ({
  onPut: market.put,
}))(observer(ShopItemList));
```

함수형 컴포넌트에 inject 와 observer 를 적용할땐 이렇게 내보내주는 과정에서 사용하시면 조금 더 깔끔합니다.

ShopItem 에서 클릭시 onPut 에 현재 자신의 name과 price 를 넣어서 호출하도록 설정을 해주겠습니다

**src/components/ShopItem.js**

```javascript
import React from 'react';
import './ShopItem.css';

const ShopItem = ({ name, price, onPut }) => {
  return (
    <div className="ShopItem" onClick={() => onPut(name, price)}>
      <h4>{name}</h4>
      <div>{price}원</div>
    </div>
  );
};

export default ShopItem;
```

<br/>

# 기능 구현하기 - 장바구니에 데이터 반영

**src/components/BasketItemList.js**

```javascript
import React from 'react';
import BasketItem from './BasketItem';
import { inject, observer } from 'mobx-react';

const BasketItemList = ({ items, total, onTake }) => {
  const itemList = items.map(item => (
    <BasketItem
      name={item.name}
      price={item.price}
      count={item.count}
      key={item.name}
      onTake={onTake}
    />
  ));
  return (
    <div>
      {itemList}
      <hr />
      <p>
        <b>총합: </b> {total}원
      </p>
    </div>
  );
};

export default inject(({ market }) => ({
  items: market.selectedItems,
  total: market.total,
  onTake: market.take,
}))(observer(BasketItemList));
```
그리고 그 내부의 BasketItem 를 구현해줄건데요,   
여기서 주의하실 점은 리스트를 렌더링하시게 될 때에 내부에 있는 컴포넌트에도 observer 를 구현해주어야, 성능적으로 최적화가 일어난다는 점 입니다.

**src/components/BasketItem.js**

```javascript
import React from 'react';
import './BasketItem.css';
import { observer } from 'mobx-react';

const BasketItem = ({ name, price, count, onTake }) => {
  return (
    <div className="BasketItem">
      <div className="name">{name}</div>
      <div className="price">{price}원</div>
      <div className="count">{count}</div>
      <div className="return" onClick={() => onTake(name)}>갖다놓기</div>
    </div>
  );
};

export default observer(BasketItem);
```
다음과 같이 observer 를 하단이 아닌 위에서 설정해줘도 동일하게 작동합니다.

```javascript
import React from 'react';
import './BasketItem.css';
import { observer } from 'mobx-react';

const BasketItem = observer(({ name, price, count, onTake }) => {
  return (
    <div className="BasketItem" onClick={() => onTake(name)}>
      <div className="name">{name}</div>
      <div className="price">{price}원</div>
      <div className="count">{count}</div>
      <div className="return">갖다놓기</div>
    </div>
  );
});

export default BasketItem;
```

<br/>

# 스토어 끼리 관계형성
지금은 counter 와 market 이 전혀 관계가 없기 때문에 서로간의 접근은 불필요 한 상황이지만, 만약에 해야한다면 어떻게 해야하는지 알아봅시다.

스토어끼리 접근을 하려면, 우리는 RootStore 라는것을 만들어주어야 합니다.

stores 에 index.js 라는 파일을 만들어보세요.

**src/stores/index.js**
```javascript
import CounterStore from './counter';
import MarketStore from './market';

class RootStore {
  constructor() {
    this.counter = new CounterStore(this);
    this.market = new MarketStore(this);
  }
}

export default RootStore;
```
여기서, 다른 스토어들을 불러오고 constructor 에서 각 스토어를 만들어준 다음에,`this.스토어명 = new 새로운스토어(this)` 이런식으로 입력해줍니다.

 뒷부분에서 this 를 파라미터를 넣어주는게 중요합니다. 
 이렇게 함으로서 각 스토어들이, 현재 루트 스토어가 무엇인지 알 수 있게 됩니다.

우리가 각 스토어를 만들 떄 루트 스토어를 파라미터로 넣어주었으니, 
이를 따로 값으로 저장해두게끔 해주겠습니다.

**src/stores/counter.js**

```javascript
import { observable, action } from 'mobx';

export default class CounterStore {
  @observable number = 0;

  // **** 추가됨
  constructor(root) {
    this.root = root;
  }

  @action increase = () => {
    this.number++;
  }

  @action decrease = () => {
    this.number--;
  }
}
```
**src/stores/market.js**

```javascript
import { observable, action, computed } from 'mobx';

export default class MarketStore {
  @observable selectedItems = [];

  // **** 추가됨
  constructor(root) {
    this.root = root;
  }


  // 이하 생략..
}
```
이제, 프로젝트의 엔트리 index.js 에서 Provider 쪽에 스토어를 전달해줄 차례입니다. 

다음과 같이 루트 스토어를 만들고 spread 문법으로 Provider 쪽에 props 를 풀어주시면 자동으로 counter 스토어와 market 스토어가 전달됩니다.

**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react'; // MobX 에서 사용하는 Provider
import App from './App';
import RootStore from './stores';

const root = new RootStore(); // *** 루트 스토어 생성

ReactDOM.render(
  <Provider {...root}> {/* *** ...root 으로 스토어 모두 자동으로 설정 */}
    <App />
  </Provider>,
  document.getElementById('root')
);
```

만약에, market 에서 counter 에 접근하고 싶다면, 
this.root.counter.number 이런식으로 조회해서 사용해보면 됩니다.

한번, 현재 스토어의 값에 따라 한번 상품을 클릭 할 시 몇개를 집어올 지 정해줘보도록 하겠습니다.

우선 편의상 카운터의 기본 값을 1로 해주겠습니다.

```javascript
import { observable, action } from 'mobx';

export default class CounterStore {
  @observable number = 1; // ****  기본 값 1로 업데이트

  // **** 추가됨
  constructor(root) {
    this.root = root;
  }

  @action
  increase = () => {
    this.number++;
  };

  @action
  decrease = () => {
    this.number--;
  };
}
```

다음에, market 에서 상품을 한번 집어 올 때 마다 카운터에 있는 상태의 갯수만큼 들고오게 구현을 해보겠습니다.

**src/stores/market.js - put 액션**

```javascript
@action
put = (name, price) => {
  const { number } = this.root.counter;
  // 존재하는지 찾고
  const exists = this.selectedItems.find(item => item.name === name);
  if (!exists) {
    // 존재하지 않는다면 새로 집어넣습니다.
    this.selectedItems.push({
      name,
      price,
      count: number,
    });
    return;
  }
  exists.count += number;
};
```

이렇게 하면, 예를들어 카운터의 값이 2면, 한번 상품이 클릭 될 때마다 두개씩 받아옵니다.

<br/>

# MobX 의 리액트 컴포넌트 최적화

## 1. 리스트를 렌더링 할 땐, 컴포넌트에 리스트 관련 데이터만 props 로 넣자

리스트가 렌더링 될 때는 성능에 대해서 신경을 써주셔야 하는데요,   
리스트 컴포넌트에 리스트 관련 props 만 넣는것을 권장합니다.   
예를 들어서 다음과 같은 코드는 비효율 적입니다.  

```javascript
@observer class MyComponent extends Component {
  render() {
    const {todos, user} = this.props;
    return (
      <div>
        {user.name}
        <ul>
            {todos.map(todo => <TodoView todo={todo} key={todo.id} />)}
        </ul>
      </div>
    )
  }
}
```

이런 코드는 별로 좋지 않습니다.   
왜냐하면 user.name 이 바뀔때도 컴포넌트가 리렌더링 되기 때문이죠.   
이러한 구조 대신 아예 리스트를 잘 분리시켜서 다음과 같이 하는 것이 좋습니다.  

```javascript
observer class MyComponent extends Component {
  render() {
    const {todos, user} = this.props;
    return (
      <div>
        {user.name}
        <TodosView todos={todos} />
      </div>
    )
  }
}

@observer class TodosView extends Component {
  render() {
    const {todos} = this.props;
    return (
      <ul>
        {todos.map(todo => <TodoView todo={todo} key={todo.id} />)}
      </ul>
    )
  }
}
```

## 2. 세부참조 (dereference)는 최대한 늦게하자

여기서 세부 참조 (혹은 역참조) 란, 우리가 특정 객체의 내부의 값을 조회하는것을 말합니다.   
예를 들어서 우리가 장바구니의 정보들을 보여줄 때 다음과 같은 코드를 사용했었는데요,

```javascript
  const itemList = items.map(item => (
    <BasketItem
      name={item.name}
      price={item.price}
      count={item.count}
      key={item.name}
      onTake={onTake}
    />
  ));
```

여기서 item 에서 name, price, count 를 조회하는것이, 세부참조입니다.

만약에, 코드를 이런식으로 하면 업데이트 성능 최적화를 이뤄낼 수 있습니다.

```javascript
const itemList = items.map(item => (
  <BasketItem
    item={item}
    key={item.name}
    onTake={onTake}
  />
));
```

변동이 일어날 수 있는 count 값의 세부참조를 우리는 BasketItem 컴포넌트 내부에서 하게 된다면,   
더 높은 성능으로 컴포넌트를 업데이트 할 수 있습니다.   

여기서 item.name 값은 바뀌지 않기 때문에 key 설정 부분에선 문제가 되지 않습니다.

## 3. 함수는 미리 바인딩하고, 파라미터는 내부에서 넣어주기

컴포넌트에 함수를 전달해 줄 때에는 미리 바인딩 하는것이 좋고,   
파라미터가 유동적일땐 파라미터를 넣는 작업을 컴포넌트 밖이 아니라 안에서 하는것이 좋습니다.

예를들어서 다음과 같은 코드는 썩 좋은 코드가 아닙니다.

```javascript
render() {
  return <MyWidget onClick={() => { alert('hi') }} />
}
```

그 대신에 이렇게 하는것이 좋습니다.

```javascript
render() {
  return <MyWidget onClick={this.handleClick} />
}

handleClick = () => {
    alert('hi')
}
```

그리고 다음과 같은 코드 또한 별로 좋지 않습니다.

```javascript
const ShopItemList = ({ onPut }) => {
  const itemList = items.map(item => (
    <ShopItem {...item} key={item.name} onPut={() => onPut(item.name, item.price)} />
  ));
  return <div>{itemList}</div>;
};
```

그 대신에 우리가 이전에 작성했던 코드처럼 onPut={onPut} 이렇게 전달하고 파라미터는 컴포넌트 내부에서 넣어주는것이 좋죠.

```javascript
const ShopItemList = ({ onPut }) => {
  const itemList = items.map(item => (
    <ShopItem {...item} key={item.name} onPut={onPut} />
  ));
  return <div>{itemList}</div>;
};

const ShopItem = ({ name, price, onPut }) => {
  return (
    <div className="ShopItem" onClick={() => onPut(name, price)}>
      <h4>{name}</h4>
      <div>{price}원</div>
    </div>
  );
};
```

<br/>

# 만든 프로젝트를 개선시키기

우리는 프로젝트를 만들 때 3번 규칙은 잘 따라줬지만,   
1번과 2번은 조금은 부족하게 따라줬습니다.   

예를들어서, BasketItemList 에서 세부 참조를 바로 해줬었고,   
total 값을 리스트에서 props 로 받아오게 했습니다.  

때문에, 만약에 상품의 갯수가 달라지게 될 때,   
BasketItemList 에서도 리렌더링이 일어났고,     
BasketItem 에서도 리렌더링이 일어났습니다.  

신라면을 추가했을 때 리스트 전체적인 렌더링을 했고,   
나머지 생수/새우깡/포카칩은 리렌더링은 이미 최적화가 이뤄져서   
(observer 가 자동으로 해줬습니다) 리렌더링이 되지 않았고,   
신라면만 리렌더링이 됐죠.  

사실 지금의 성능도 충분하긴 하지만. 여기서 조금만 고쳐주면 BasketItemList 의 렌더링을 방지해서 배열 map 하는 작업 자체를 생략할 수도 있습니다.

첫번째로, 총합이 나타나는 부분을 컴포넌트화 해주겠습니다.

**src/components/TotalPrice.js**

```javascript
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

@inject(({ market }) => ({ total: market.total }))
@observer
class TotalPrice extends Component {
  render() {
    const { total } = this.props;
    return (
      <div>
        <hr />
        <p>
          <b>총합: </b> {total}원
        </p>
      </div>
    );
  }
}

export default TotalPrice;
```

편의상 클래스형태로 작성해주었는데요,   
함수형으로 작성하던, 클래스형으로 작성하던 큰 상관은 없습니다.   
클래스형태로 작성하면 decorator 를 편하게 쓸 수 있다는 장점이 존재합니다.  

그리고 이 컴포넌트를 SuperMarketTemplate 의 total 이라는 값으로   
JSX 형태로 전달해주겠습니다.

**src/components/SuperMarket.js**

```javascript
import React from 'react';
import SuperMarketTemplate from './SuperMarketTemplate';
import ShopItemList from './ShopItemList';
import BasketItemList from './BasketItemList';
import TotalPrice from './TotalPrice';

const SuperMarket = () => {
  return (
    <SuperMarketTemplate
      items={<ShopItemList />}
      basket={<BasketItemList />}
      total={<TotalPrice />}
    />
  );
};

export default SuperMarket;
```

**src/components/SuperMarketTemplate.js**

```javascript
import React from 'react';
import './SuperMarketTemplate.css';

const SuperMarketTemplate = ({ items, basket, total }) => {
  return (
    <div className="SuperMarketTemplate">
      <div className="items-wrapper">
        <h2>상품</h2>
        {items}
      </div>
      <div className="basket-wrapper">
        <h2>장바구니</h2>
        {basket}
        {total}
      </div>
    </div>
  );
};
export default SuperMarketTemplate;
```

그 다음, BracketItemList 에서 props 로 받아오던 total 은 없애고,   
세부 참조를 BracketItem 내부에서 하도록 수정해주겠습니다.

**src/components/BracketItemList.js**

```javascript
import React from 'react';
import BasketItem from './BasketItem';
import { inject, observer } from 'mobx-react';

const BasketItemList = ({ items, total, onTake }) => {
  const itemList = items.map(item => (
    <BasketItem item={item} key={item.name} onTake={onTake} />
  ));
  return <div>{itemList}</div>;
};

export default inject(({ market }) => ({
  items: market.selectedItems,
  onTake: market.take,
}))(observer(BasketItemList));
```

**src/components/BracketItem.js**

```javascript
import React from 'react';
import './BasketItem.css';
import { observer } from 'mobx-react';

const BasketItem = observer(({ item, onTake }) => {
  return (
    <div className="BasketItem">
      <div className="name">{item.name}</div>
      <div className="price">{item.price}원</div>
      <div className="count">{item.count}</div>
      <div className="return" onClick={() => onTake(item.name)}>
        갖다놓기
      </div>
    </div>
  );
});

export default BasketItem;
```

이렇게 하면 최적화가 끝납니다!


BracketItemList 컴포넌트 전체가 리렌더링된것이 아니라,   
그 내부의 TotalPrice 와 필요한 아이템만 업데이트가 되고있습니다.   
물론, 지금은 체감되는 차이가 없겠지만 앱의 규모가 커진다면,   
이렇게 최적화를 해주면 확실히 체감 될 것입니다.  



