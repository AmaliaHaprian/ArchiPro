import './Features.css'
import firstFeature from '../assets/firstFeature.jpg'
import secondFeature from '../assets/secondFeature.jpg'
function Features(){
    return (
        <div className="features" >
          <div className="feature-row">
            <div className="feature-text">
                <h2>Track and mangage architecture projects easily</h2>
                <p>A platform designed for architecture students...</p>
            </div>
            <div className="feature-image">
              <img src={firstFeature} alt="Feature 1" />
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-image">
              <img src={secondFeature} alt="Feature 2" />
            </div>
            <div className="feature-text">
                <p>...to organize their design process, track projectprogress and generate portfolio layouts. From start to finish.</p>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-card-text">
                <h3>Manage projects</h3>
                <p>Keep all your work in an organized manner. Create projects, document each stage of development, upload images and files, and follow the evolution of your work from concept to final presentation.</p>
            </div>
             <div className="feature-card-text">
                <h3>Project Stages</h3>
                <p>Break project into design stages, where you can store information, sketches and visual diagrams, making it easier to keep track of ideas and design decisions throughout the project.</p>
            </div>
             <div className="feature-card-text">
                <h3>Monitor progress</h3>
                <p>Monitor your progress and stay organized, through clear project overviews and detailed views for each project.</p>
            </div>
          </div>
        </div>
    )
}

export default Features;