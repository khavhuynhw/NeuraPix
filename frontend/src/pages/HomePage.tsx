import React from "react";
import { Button, Input } from "antd";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";

const Section = styled.section`
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Hero = styled(Section)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  flex-wrap: wrap;
  gap: 48px;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

const SubHeading = styled.p`
  max-width: 460px;
  margin-top: 1rem;
  font-size: 1rem;
`;

const ActionButtons = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const HeroImage = styled.img`
  max-width: 460px;
  border-radius: 1rem;
`;

const DiscoverImagesWrapper = styled.div`
  position: relative;
  margin-top: 64px;
  width: 100%;
  max-width: 960px;
  height: 340px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DiscoverImage = styled.img`
  position: absolute;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const TemplateSection = styled(Section)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  flex-wrap: wrap;
  gap: 48px;
`;

const EmailInput = styled(Input)`
  max-width: 300px;
  margin-right: 8px;
`;

const BlueFooter = styled.footer`
  background: #0079ff;
  padding: 60px 24px;
  color: white;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
`;

const HomePage = () => {
  const navigate = useNavigate(); // 👈 Hook điều hướng

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <>
      {/* Hero Section */}
      <Hero>
        <div>
          <Heading>Welcome To NEURAPIX</Heading>
          <SubHeading>
            NEURAPIX is an <b>AI-powered</b> photo editing platform that
            enhances images instantly. With advanced AI features, it adjusts
            colors, removes noise, sharpens details, and restores photos
            effortlessly—perfect for both professionals and casual users—
            <b>no Photoshop skills needed!</b>
          </SubHeading>
          <ActionButtons>
            <Button type="primary" onClick={handleRegister}>Register</Button>
            <Button onClick={handleLogin}>Log In</Button>
          </ActionButtons>
        </div>
        <HeroImage src="./src/assets/home-hero.png" alt="Hero Image" />
      </Hero>

      {/* Discover Section */}
      <Section>
        <Heading>Discover the Future of AI Photo Editing with NEURAPIX</Heading>
        <SubHeading>
          NEURAPIX brings cutting-edge <b>AI technology</b> to photo editing,
          making it faster, smarter, and effortlessly professional. Enhance
          colors, remove noise, sharpen details, and restore old images —all in
          just <b>one click</b>. Experience the future of image editing today!
        </SubHeading>
        <ActionButtons>
          <Button type="primary" onClick={handleRegister}>Register</Button>
            <Button onClick={handleLogin}>Log In</Button>
        </ActionButtons>

        <DiscoverImagesWrapper>
          <DiscoverImage
            src="./src/assets/discover-left.jpg"
            alt="Left"
            style={{ width: "240px", bottom: 0, left: 0, zIndex: 2 }}
          />
          <img
            src="./src/assets/discover-middle.jpg"
            alt="Middle"
            style={{
              width: "420px",
              borderRadius: "20px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
              zIndex: 1,
              position: "relative",
            }}
          />
          <DiscoverImage
            src="./src/assets/discover-right.jpg"
            alt="Right"
            style={{ width: "240px", top: 0, right: 0, zIndex: 3 }}
          />
        </DiscoverImagesWrapper>
      </Section>

      {/* Template Section */}
      <TemplateSection>
        <HeroImage src="./src/assets/templates.png" alt="Templates" />
        <div style={{ maxWidth: 500 }}>
          <Heading>
            Effortless Photo Editing with Free AI-Powered Templates
          </Heading>
          <SubHeading>
            Enhance your images instantly using our free, professionally{" "}
            <b>designed templates</b>. NEURAPIX lets you apply stunning edits
            with just one click—<b>no experience needed!</b>
          </SubHeading>
          <div style={{ display: "flex", marginTop: 16 }}>
            <EmailInput placeholder="Enter your email" />
            <Button type="primary">Register</Button>
          </div>
        </div>
      </TemplateSection>

      {/* Footer */}
      <BlueFooter>
        <div>
          <h3>NEURAPIX</h3>
          <p>
            Subscribe to our newsletter for the latest updates on features and
            releases.
          </p>
          <div style={{ display: "flex", marginTop: 8 }}>
            <Input placeholder="Your email here" style={{ marginRight: 8 }} />
            <Button>Join</Button>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <p>Home Page</p>
          <p>About Us</p>
          <p>Contact Us</p>
        </div>
        <div>
          <h4>Resources</h4>
          <p>FAQs</p>
          <p>Webinars</p>
          <p>Guides</p>
        </div>
        <div>
          <h4>Connect With Us</h4>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>X (Twitter)</p>
          <p>LinkedIn</p>
          <p>YouTube</p>
        </div>
      </BlueFooter>
    </>
  );
};

export default HomePage;
