package com.newlife.quanlysimbox;

import com.newlife.quanlysimbox.communicator.CommPortIdentifierManager;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class QuanlysimboxApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(QuanlysimboxApplication.class, args);
        context.getBean(CommPortIdentifierManager.class).connectToSimbox();
    }
}
