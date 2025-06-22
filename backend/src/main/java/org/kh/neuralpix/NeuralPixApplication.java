package org.kh.neuralpix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NeuralPixApplication {

    public static void main(String[] args) {
        SpringApplication.run(NeuralPixApplication.class, args);
    }

}
