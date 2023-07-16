class LinkedList {

	constructor(arrayInitializer){
		this.array = arrayInitializer;
		this.linkedList = {};
		this.pointerRef = {};

		this._convertArrayToLL();
	}

	getArrayBack(){
		let pointerIndexSoldier = 0;
		let pointerSoldier = this.linkedList;
		let array = [];

		while(pointerSoldier !== null && pointerIndexSoldier >= 0) {

			array.push(pointerSoldier.v);	
			pointerSoldier = pointerSoldier.c;
			pointerIndexSoldier++;
		}

		return array;

	}

	_convertArrayToLL(){
		for(let i = 0; i < this.array.length; i++){
			if(i === 0){
				this.pointerRef = this.linkedList = {
					v: this.array[i],
					c: null
				}
			}
			else{
				this.pointerRef.c = {
					v: this.array[i],
					c: null
				}	

				this.pointerRef = this.pointerRef.c;
			}
		}
	}

	getElementAtIndex(n){
		let pointerIndexSoldier = 0;
		let pointerSoldier = this.linkedList;

		while(pointerSoldier !== null && pointerIndexSoldier >= 0 && pointerIndexSoldier <= n) {
			if(pointerIndexSoldier === n){
				return pointerSoldier.v;
			}
			pointerSoldier = pointerSoldier.c;
			pointerIndexSoldier++;
		}

		return null;

	}

	insertElementAtIndex(n, elementToInsert) {
		let pointerIndexSoldier = 0;
		let pointerSoldier = this.linkedList;

		while(pointerSoldier !== null && pointerIndexSoldier >= 0 && pointerIndexSoldier <= n) {
			if(pointerIndexSoldier === n - 1){
				let oldChildren = pointerSoldier.c; 
				pointerSoldier.c = {
					v: elementToInsert,
					c: oldChildren
				};
				return true;
			}
			pointerSoldier = pointerSoldier.c;
			pointerIndexSoldier++;
		}

		return false;

	}

}

export default LinkedList;
