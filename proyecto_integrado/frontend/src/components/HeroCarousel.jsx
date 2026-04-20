import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const IMAGENES = [
  '/carrusel/1673x554-territory-h-web.avif',
  '/carrusel/1673x554-territory-t-web.avif',
  '/carrusel/1673x554-edge-web.avif',
  '/carrusel/1673x554-expedition-web.avif',
  '/carrusel/1673x554-explorer-web.avif',
  '/carrusel/1673x554-lobo-web.avif',
  '/carrusel/1673x554-maverick-web.avif',
  '/carrusel/1673x554-mustang-web.avif',
  '/carrusel/1673x554-ranger-r-web.avif',
  '/carrusel/1673x554-bronco-sport-web.avif',
  '/carrusel/1673x554-bronco-web.avif',
]

const HeroCarousel = () => (
  <div className="hero-carousel w-full">
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      loop
      grabCursor
      autoplay={{ delay: 7000, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      className="w-full"
    >
      {IMAGENES.map((src) => (
        <SwiperSlide key={src}>
          <img
            src={src}
            alt="Ford promoción"
            className="w-full h-auto block"
            draggable={false}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
)

export default HeroCarousel
