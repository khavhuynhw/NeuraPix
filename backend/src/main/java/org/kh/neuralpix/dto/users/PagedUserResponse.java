package org.kh.neuralpix.dto.users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.User;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedUserResponse {
    private List<User> users;
    private long total;
    private int page;
    private int size;
}
