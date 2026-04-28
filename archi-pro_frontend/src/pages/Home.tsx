import Hero from "../components/Hero";
import Features from "../components/Features";
import { FloorPlanOverlay } from "../animations/FloorPlan";
import { FloorPlanDraw } from "../animations/FloorPlan";
function Home() {
    return (
        <>
        <Hero />
        <Features />
        <FloorPlanOverlay />
        </>
    )
}

export default Home;