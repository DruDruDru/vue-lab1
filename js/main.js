let eventBus = new Vue()



Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        details: {
            type: Array,
            required: true
        },
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div>
            <ul>
                <span class="tab" :class="{ activeTab: selectedTab === tab }" v-for="(tab, index) in tabs"
                    @click="selectedTab = tab">{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                        <p>{{ review.recommend }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping: {{ shipping }}</p>
            </div>
            <div v-show="selectedTab === 'Details'">
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    computed: {
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    }
})

Vue.component('product-review', {
    template: `
            <form class="review-form" @submit.prevent="onSubmit">
                <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
                </p>
                <p>
                    <label for="name">Name:</label>
                    <input id="name" v-model="name" placeholder="name">
                </p>
                <p>
                    <label for="review">Review:</label>
                    <textarea id="review" v-model="review"></textarea>
                </p>
                <p>
                    <p>Would you recommend this product?</p>
                    <p>
                        <label for="no">No</label>
                        <input type="radio" id="no" class="radio" name="answer" value="no" v-model="recommend" />
                    </p>
                    <p>
                        <label for="yes">Yes</label>
                        <input type="radio" id="yes" class="radio" name="answer" value="yes" v-model="recommend" />
                    </p>
                </p>
                <p>
                    <label for="rating">Rating:</label>
                    <select id="rating" v-model.number="rating">
                        <option>5</option>
                        <option>4</option>
                        <option :disabled="isRecommend">3</option>
                        <option :disabled="isRecommend">2</option>
                        <option :disabled="isRecommend">1</option>
                    </select>
                </p>
                <p>
                    <input type="submit" value="Submit">
                </p>
            </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push('Recommend required.')
            }
        }
    },
    computed: {
        isRecommend() {
            return this.recommend === 'yes'
        }
    }
})
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText" />
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                <a :href="link">More products like this</a>
                <p v-if="inStock">In stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
                <span>{{ sale }}</span>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId" :style="{ backgroundColor:variant.variantColor
            }" @mouseover="updateProduct(index)"></div>
                <button @click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
                    Add to cart
                </button>
                <button @click="removeFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
                    Remove
                </button>
            </div>
            <product-tabs 
                :reviews="reviews" 
                :details="details"
                :premium="premium"
            ></product-tabs>
        </div>
    `,
    data() {
        return {
            product: "Socks",
            description: 'A pair of warm, fuzzy socks',
            brand: 'Vue Mastery',
            link: "https://www.amazon.com/s?k=socks&ref=nb_sb_noss",
            selectedVariant: 0,
            altText: "A pair of socks",
            onSale: false,
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage:
                        "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage:
                        "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', 
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            sales = this.onSale ? 'Sale' : '(No sale)'
            return sales + ' ' + this.product + ' ' +  this.brand ;
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        add(id) {
            this.cart.push(id);
            let divv = document.createElement('div')
            
        },
        remove(id) {
            idx = this.cart.indexOf(id);
            this.cart = this.cart.filter((value, index) => idx !== index)
        }
    }
})